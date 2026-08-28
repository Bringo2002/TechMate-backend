import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from './entities/team-member.entity';
import { DeveloperAllocation } from './entities/developer-allocation.entity';
import { TeamMembersService } from './team-members.service';
import { TeamMembersController } from './team-members.controller';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember, DeveloperAllocation])],
  controllers: [TeamMembersController, AllocationsController],
  providers: [TeamMembersService, AllocationsService],
  exports: [TeamMembersService, AllocationsService],
})
export class TeamsModule {}
