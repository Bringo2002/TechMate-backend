import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team.dto';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamMemberRepo: Repository<TeamMember>,
  ) {}

  async create(dto: CreateTeamMemberDto): Promise<TeamMember> {
    const member = this.teamMemberRepo.create({ ...dto, joinedAt: new Date() });
    return this.teamMemberRepo.save(member);
  }

  async findAll(): Promise<TeamMember[]> {
    return this.teamMemberRepo.find({
      where: { deletedAt: IsNull() },
      order: { fullName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TeamMember> {
    const member = await this.teamMemberRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }

  async update(id: string, dto: UpdateTeamMemberDto): Promise<TeamMember> {
    const member = await this.findOne(id);
    Object.assign(member, dto);
    return this.teamMemberRepo.save(member);
  }

  async remove(id: string): Promise<{ message: string }> {
    const member = await this.findOne(id);
    member.deletedAt = new Date();
    await this.teamMemberRepo.save(member);
    return { message: 'Team member deleted successfully' };
  }
}
