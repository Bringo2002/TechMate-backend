import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { NotificationsService } from './notifications.service';
import { User } from '../users/entities/user.entity';

/**
 * Notifications controller
 *
 * GET   /api/notifications        — get current user's notifications
 * PATCH /api/notifications/:id/read — mark a notification as read
 */
@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  async findAll(@Req() req: Request & { user: User }) {
    return this.notificationsService.findByUser(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Param('id') id: string) {
    await this.notificationsService.markAsRead(id);
    return { message: 'Marked as read' };
  }
}
