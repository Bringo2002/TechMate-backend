import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../users/entities/user.entity';

/**
 * Messages controller
 *
 * POST /api/messages/send                  — send a message
 * GET  /api/messages/conversation/:userId  — conversation with a specific user
 * GET  /api/messages/inbox                 — latest message from each conversation
 */
@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a message to another user' })
  async send(
    @Req() req: Request & { user: User },
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.send(req.user.id, dto.receiverId, dto.content);
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with a specific user' })
  async getConversation(
    @Req() req: Request & { user: User },
    @Param('userId') otherUserId: string,
  ) {
    return this.messagesService.getConversation(req.user.id, otherUserId);
  }

  @Get('inbox')
  @ApiOperation({ summary: 'Get inbox — latest message from each conversation' })
  async getInbox(@Req() req: Request & { user: User }) {
    return this.messagesService.getInbox(req.user.id);
  }
}
