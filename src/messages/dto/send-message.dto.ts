import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'ID of the user to send the message to' })
  @IsUUID()
  receiverId: string;

  @ApiProperty({ example: 'Hey, can we discuss the project timeline?' })
  @IsString()
  content: string;
}
