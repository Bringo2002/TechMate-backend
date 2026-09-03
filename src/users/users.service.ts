import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto, AdminUpdateUserDto } from './dto/update-profile.dto';

export interface UserFilters {
  role?: string;
  userType?: string;
  isActive?: boolean;
  search?: string;
  email?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserListOptions {
  filters?: UserFilters;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * List users with optional filtering, sorting, and pagination — matches
   * the frontend's UserFilters/QueryOptions shape (admin.service.ts's
   * getUsers). role/userType/isActive are exact matches; search does a
   * simple ILIKE on full_name (email/company search would need a raw
   * OR query — omitted for now since nothing currently depends on it;
   * add if a real search-by-email/company need shows up).
   */
  async findAll(options?: UserListOptions): Promise<{ data: User[]; total: number }> {
    const where: FindOptionsWhere<User> = { deletedAt: IsNull() };
    if (options?.filters?.role) where.role = options.filters.role as User['role'];
    if (options?.filters?.userType) where.userType = options.filters.userType as User['userType'];
    if (typeof options?.filters?.isActive === 'boolean') where.isActive = options.filters.isActive;
    if (options?.filters?.search) where.fullName = ILike(`%${options.filters.search}%`);
    if (options?.filters?.email) where.email = options.filters.email;

    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 1000; // effectively "all" when unspecified, matching prior findAll() behavior
    const sortBy = (options?.sortBy ?? 'fullName') as keyof User;

    const [data, total] = await this.userRepo.findAndCount({
      where,
      order: { [sortBy]: options?.sortDir ?? 'ASC' } as Record<string, 'ASC' | 'DESC'>,
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return { data, total };
  }

  /**
   * Get a user's profile by ID.
   * Returns only public/profile-relevant fields (password excluded by entity @Exclude).
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Update a user's profile — only the fields provided in the DTO.
   * Explicit field-by-field assignment (not Object.assign) so a future
   * DTO/entity naming mismatch fails to compile instead of silently
   * no-op-ing, the way the old `name` (vs. entity's `fullName`) field
   * did after the User entity was rebuilt to match profiles.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.company !== undefined) user.company = dto.company;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.username !== undefined) user.username = dto.username;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.website !== undefined) user.website = dto.website;
    if (dto.jobTitle !== undefined) user.jobTitle = dto.jobTitle;
    if (dto.location !== undefined) user.location = dto.location;

    return this.userRepo.save(user);
  }

  /**
   * Admin-only update — role/userType/isAdmin/isActive. Deliberately a
   * separate method from updateProfile so the admin-only field set stays
   * enforced at the DTO level too, not just by convention.
   */
  async adminUpdate(userId: string, dto: AdminUpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  /** Soft-delete a user (admin only) — same pattern as every other module. */
  async softDelete(userId: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.deletedAt = new Date();
    user.isActive = false;
    await this.userRepo.save(user);
    return { message: 'User deleted successfully' };
  }

  /**
   * Update a user's avatar URL after file upload.
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<{ avatarUrl: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatarUrl = avatarUrl;
    await this.userRepo.save(user);
    return { avatarUrl };
  }

  async getUserCount(): Promise<number> {
    return this.userRepo.count({ where: { deletedAt: IsNull() } });
  }

  async getActiveUserCount(): Promise<number> {
    return this.userRepo.count({ where: { deletedAt: IsNull(), isActive: true } });
  }
}
