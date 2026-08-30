import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { UserSettingsService } from './user-settings.service';
import { UpsertUserSettingsDto } from './dto/user-settings.dto';

/**
 * GET /api/user-settings/:userId — get a user's settings (null if none saved yet)
 * PUT /api/user-settings         — upsert
 */
@ApiTags('User Settings')
@ApiBearerAuth()
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get(':userId')
  @ApiOperation({ summary: "Get a user's settings" })
  findByUser(@Param('userId') userId: string) {
    return this.userSettingsService.findByUser(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Upsert user settings' })
  upsert(@Body() dto: UpsertUserSettingsDto) {
    return this.userSettingsService.upsert(dto);
  }
}
