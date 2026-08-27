import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { ProjectAssignment } from './entities/project-assignment.entity';
import { ProjectUpdate } from './entities/project-update.entity';
import { Deliverable } from './entities/deliverable.entity';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateProjectAssignmentDto,
  CreateProjectUpdateDto,
} from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectAssignment)
    private readonly assignmentRepo: Repository<ProjectAssignment>,
    @InjectRepository(ProjectUpdate)
    private readonly updateRepo: Repository<ProjectUpdate>,
    @InjectRepository(Deliverable)
    private readonly deliverableRepo: Repository<Deliverable>,
  ) {}

  // ── Core CRUD ──────────────────────────────────────────────

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepo.create(dto);
    return this.projectRepo.save(project);
  }

  /** All projects, optionally filtered by userId. Excludes soft-deleted. */
  async findAll(userId?: string): Promise<Project[]> {
    return this.projectRepo.find({
      where: { ...(userId ? { userId } : {}), deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async remove(id: string): Promise<{ message: string }> {
    const project = await this.findOne(id);
    project.deletedAt = new Date();
    await this.projectRepo.save(project);
    return { message: 'Project deleted successfully' };
  }

  // ── Stats (mirrors the frontend's getProjectStats shape) ───

  async getStats(userId?: string) {
    const projects = await this.projectRepo.find({
      where: { ...(userId ? { userId } : {}), deletedAt: IsNull() },
      select: ['status', 'budget', 'spent', 'healthScore'],
    });

    return {
      total: projects.length,
      active: projects.filter((p) => p.status === ProjectStatus.ACTIVE).length,
      completed: projects.filter((p) => p.status === ProjectStatus.COMPLETED).length,
      planning: projects.filter((p) => p.status === ProjectStatus.PLANNING).length,
      totalBudget: projects.reduce((s, p) => s + Number(p.budget ?? 0), 0),
      totalSpent: projects.reduce((s, p) => s + Number(p.spent ?? 0), 0),
      avgHealth:
        projects.length > 0
          ? Math.round(
              projects.reduce((s, p) => s + (p.healthScore ?? 0), 0) / projects.length,
            )
          : 0,
    };
  }

  // ── Assignments ──────────────────────────────────────────────

  async addAssignment(
    projectId: string,
    dto: CreateProjectAssignmentDto,
  ): Promise<ProjectAssignment> {
    await this.findOne(projectId); // 404s if project doesn't exist
    const assignment = this.assignmentRepo.create({ ...dto, projectId });
    return this.assignmentRepo.save(assignment);
  }

  async getAssignments(projectId: string): Promise<ProjectAssignment[]> {
    return this.assignmentRepo.find({
      where: { projectId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  // ── Updates (progress log) ──────────────────────────────────

  async addUpdate(
    projectId: string,
    dto: CreateProjectUpdateDto,
  ): Promise<ProjectUpdate> {
    await this.findOne(projectId);
    const update = this.updateRepo.create({ ...dto, projectId } as Partial<ProjectUpdate>);
    return this.updateRepo.save(update);
  }

  /** Client-facing callers should pass clientVisibleOnly=true. */
  async getUpdates(projectId: string, clientVisibleOnly = false): Promise<ProjectUpdate[]> {
    return this.updateRepo.find({
      where: {
        projectId,
        deletedAt: IsNull(),
        ...(clientVisibleOnly ? { isVisibleToClient: true } : {}),
      },
      order: { createdAt: 'DESC' },
    });
  }

  // ── Deliverables ─────────────────────────────────────────────

  async getDeliverables(projectId: string): Promise<Deliverable[]> {
    return this.deliverableRepo.find({
      where: { projectId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }
}
