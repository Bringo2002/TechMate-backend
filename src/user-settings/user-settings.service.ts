import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from './entities/user-settings.entity';
import { UpsertUserSettingsDto } from './dto/user-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly settingsRepo: Repository<UserSettings>,
  ) {}

  /**
   * Returns null rather than 404ing when no settings row exists yet —
   * matches the frontend's handling of Supabase's PGRST116 (no rows) as
   * "use defaults", not an error.
   */
  async findByUser(userId: string): Promise<UserSettings | null> {
    return this.settingsRepo.findOne({ where: { userId } });
  }

  /** Upsert — one row per user, matching the unique constraint on user_id. */
  async upsert(dto: UpsertUserSettingsDto): Promise<UserSettings> {
    const existing = await this.settingsRepo.findOne({ where: { userId: dto.userId } });
    if (existing) {
      Object.assign(existing, dto);
      return this.settingsRepo.save(existing);
    }
    const created = this.settingsRepo.create(dto);
    return this.settingsRepo.save(created);
  }
}
