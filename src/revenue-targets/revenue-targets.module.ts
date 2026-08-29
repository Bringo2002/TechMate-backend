import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevenueTarget } from './entities/revenue-target.entity';
import { RevenueTargetsService } from './revenue-targets.service';
import { RevenueTargetsController } from './revenue-targets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RevenueTarget])],
  controllers: [RevenueTargetsController],
  providers: [RevenueTargetsService],
  exports: [RevenueTargetsService],
})
export class RevenueTargetsModule {}
