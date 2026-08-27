import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { User } from '../users/entities/user.entity';

/**
 * GET    /api/notifications              — current user's notifications
 * GET    /api/notifications/unread-count — unread count for current user
 * POST   /api/notifications              — create (system/admin use)
 * PATCH  /api/notifications/:id/read     — mark one as read
 * PATCH  /api/notifications/read-all     — mark all as read for current user
 * DELETE /api/notifications/:id          — delete one
 * DELETE /api/notifications              — clear all for current user
 */
@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get current user's notifications" })
  findAll(@Req() req: Request & { user: User }) {
    return this.notificationsService.findByUser(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread notification count for current user' })
  async getUnreadCount(@Req() req: Request & { user: User }) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  markAllAsRead(@Req() req: Request & { user: User }) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Delete()
  @ApiOperation({ summary: "Clear all of current user's notifications" })
  removeAll(@Req() req: Request & { user: User }) {
    return this.notificationsService.removeAll(req.user.id);
  }
}
