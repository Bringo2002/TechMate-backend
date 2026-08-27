import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientInquiry } from './entities/client-inquiry.entity';
import { ClientInquiriesService } from './client-inquiries.service';
import { ClientInquiriesController } from './client-inquiries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClientInquiry])],
  controllers: [ClientInquiriesController],
  providers: [ClientInquiriesService],
  exports: [ClientInquiriesService],
})
export class ClientInquiriesModule {}
