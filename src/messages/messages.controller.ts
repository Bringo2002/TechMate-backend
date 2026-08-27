import { Controller, Post, Get, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/message.dto';
import { User } from '../users/entities/user.entity';

/**
 * POST   /api/messages/send                   — send a message
 * GET    /api/messages/inbox                   — conversation list (ConversationSummary[])
 * GET    /api/messages/conversation/:contactId — full thread with one contact
 * GET    /api/messages/unread-count            — unread count for current user
 * PATCH  /api/messages/conversation/:contactId/read — mark a conversation read
 * DELETE /api/messages/:id                     — delete own message
 */
@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a message to another user' })
  send(@Req() req: Request & { user: User }, @Body() dto: SendMessageDto) {
    return this.messagesService.send(req.user.id, dto);
  }

  @Get('inbox')
  @ApiOperation({ summary: 'Conversation list — latest message + unread count per contact' })
  getInbox(@Req() req: Request & { user: User }) {
    return this.messagesService.getInbox(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Total unread message count for current user' })
  async getUnreadCount(@Req() req: Request & { user: User }) {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return { count };
  }

  @Get('conversation/:contactId')
  @ApiOperation({ summary: 'Full message thread with a specific contact' })
  getConversation(
    @Req() req: Request & { user: User },
    @Param('contactId') contactId: string,
  ) {
    return this.messagesService.getConversation(req.user.id, contactId);
  }

  @Patch('conversation/:contactId/read')
  @ApiOperation({ summary: 'Mark all messages from a contact as read' })
  markConversationRead(
    @Req() req: Request & { user: User },
    @Param('contactId') contactId: string,
  ) {
    return this.messagesService.markConversationRead(req.user.id, contactId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message you sent' })
  remove(@Req() req: Request & { user: User }, @Param('id') id: string) {
    return this.messagesService.remove(id, req.user.id);
  }
}
