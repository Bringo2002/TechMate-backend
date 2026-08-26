import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

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
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Merge only provided fields
    Object.assign(user, dto);
    return this.userRepo.save(user);
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
}
