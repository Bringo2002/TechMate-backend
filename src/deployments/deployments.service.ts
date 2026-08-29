import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { Deployment, DeploymentStatus } from './entities/deployment.entity';
import { DeploymentStage, StageStatus } from './entities/deployment-stage.entity';
import { DeploymentInsight } from './entities/deployment-insight.entity';
import { DeploymentLog } from './entities/deployment-log.entity';
import { DeploymentApproval, ApprovalStatus } from './entities/deployment-approval.entity';
import {
  CreateDeploymentDto,
  UpdateDeploymentDto,
  UpdateDeploymentStageDto,
  AddDeploymentLogDto,
  RequestApprovalDto,
  ResolveApprovalDto,
  SearchDeploymentsDto,
} from './dto/deployment.dto';

const DEFAULT_STAGES = ['Clone', 'Install', 'Build', 'Test', 'Deploy', 'Verify'];

export interface DeploymentFilters {
  status?: string;
  environmentId?: string;
  projectId?: string;
  triggeredBy?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class DeploymentsService {
  constructor(
    @InjectRepository(Deployment) private readonly deploymentRepo: Repository<Deployment>,
    @InjectRepository(DeploymentStage) private readonly stageRepo: Repository<DeploymentStage>,
    @InjectRepository(DeploymentInsight) private readonly insightRepo: Repository<DeploymentInsight>,
    @InjectRepository(DeploymentLog) private readonly logRepo: Repository<DeploymentLog>,
    @InjectRepository(DeploymentApproval) private readonly approvalRepo: Repository<DeploymentApproval>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ── Deployments + Stages ──────────────────────────────────────

  async create(dto: CreateDeploymentDto): Promise<Deployment> {
    const deployment = this.deploymentRepo.create({
      projectId: dto.projectId,
      environmentId: dto.environmentId,
      projectName: dto.projectName,
      environmentName: dto.environmentName,
      branch: dto.branch,
      commitHash: dto.commitHash,
      commitMessage: dto.commitMessage,
      triggeredBy: dto.triggeredBy,
      triggeredByName: dto.triggeredByName,
      triggerType: dto.triggerType,
    });
    const saved = await this.deploymentRepo.save(deployment);

    const stageInputs = dto.stages?.length
      ? dto.stages
      : DEFAULT_STAGES.map((name, i) => ({ name, stageOrder: i, status: StageStatus.PENDING }));

    const stages = stageInputs.map((s) =>
      this.stageRepo.create({ ...s, deploymentId: saved.id }),
    );
    await this.stageRepo.save(stages);

    return this.findOne(saved.id);
  }

  async findAll(filters?: DeploymentFilters): Promise<Deployment[]> {
    const deployments = await this.deploymentRepo.find({
      where: {
        deletedAt: IsNull(),
        ...(filters?.status && filters.status !== 'all' ? { status: filters.status as DeploymentStatus } : {}),
        ...(filters?.environmentId ? { environmentId: filters.environmentId } : {}),
        ...(filters?.projectId ? { projectId: filters.projectId } : {}),
        ...(filters?.triggeredBy ? { triggeredBy: filters.triggeredBy } : {}),
      },
      relations: ['stages'],
      order: { createdAt: 'DESC' },
      take: filters?.limit ?? 20,
      skip: filters?.offset ?? 0,
    });

    for (const d of deployments) {
      d.stages = (d.stages ?? []).sort((a, b) => a.stageOrder - b.stageOrder);
    }
    return deployments;
  }

  async findOne(id: string): Promise<Deployment> {
    const deployment = await this.deploymentRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stages'],
    });
    if (!deployment) throw new NotFoundException('Deployment not found');
    deployment.stages = (deployment.stages ?? []).sort((a, b) => a.stageOrder - b.stageOrder);
    return deployment;
  }

  async update(id: string, dto: UpdateDeploymentDto): Promise<Deployment> {
    const deployment = await this.findOne(id);
    Object.assign(deployment, dto);
    await this.deploymentRepo.save(deployment);
    return this.findOne(id);
  }

  async rollback(id: string): Promise<Deployment> {
    const deployment = await this.findOne(id);
    deployment.status = DeploymentStatus.ROLLED_BACK;
    deployment.completedAt = new Date();
    await this.deploymentRepo.save(deployment);
    return this.findOne(id);
  }

  async updateStage(stageId: string, dto: UpdateDeploymentStageDto): Promise<DeploymentStage> {
    const stage = await this.stageRepo.findOne({ where: { id: stageId } });
    if (!stage) throw new NotFoundException('Deployment stage not found');
    Object.assign(stage, dto);
    return this.stageRepo.save(stage);
  }

  // ── Insights ──────────────────────────────────────────────────

  async getInsights(deploymentId?: string): Promise<DeploymentInsight[]> {
    return this.insightRepo.find({
      where: { isDismissed: false, ...(deploymentId ? { deploymentId } : {}) },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async dismissInsight(id: string): Promise<DeploymentInsight> {
    const insight = await this.insightRepo.findOne({ where: { id } });
    if (!insight) throw new NotFoundException('Insight not found');
    insight.isDismissed = true;
    return this.insightRepo.save(insight);
  }

  // ── Logs ──────────────────────────────────────────────────────

  async getLogs(deploymentId: string, stageName?: string): Promise<DeploymentLog[]> {
    return this.logRepo.find({
      where: { deploymentId, ...(stageName ? { stageName } : {}) },
      order: { timestamp: 'ASC' },
    });
  }

  async addLog(deploymentId: string, dto: AddDeploymentLogDto): Promise<DeploymentLog> {
    const log = this.logRepo.create({ ...dto, deploymentId });
    return this.logRepo.save(log);
  }

  // ── Approvals ─────────────────────────────────────────────────

  async getApprovals(deploymentId: string): Promise<DeploymentApproval[]> {
    return this.approvalRepo.find({
      where: { deploymentId },
      order: { createdAt: 'DESC' },
    });
  }

  async requestApproval(deploymentId: string, dto: RequestApprovalDto): Promise<DeploymentApproval> {
    const approval = this.approvalRepo.create({
      deploymentId,
      requestedBy: dto.requestedBy,
      requestedByName: dto.requestedByName,
      status: ApprovalStatus.PENDING,
    });
    const saved = await this.approvalRepo.save(approval);

    const deployment = await this.findOne(deploymentId);
    deployment.approvalStatus = 'pending' as Deployment['approvalStatus'];
    await this.deploymentRepo.save(deployment);

    return saved;
  }

  async resolveApproval(approvalId: string, dto: ResolveApprovalDto): Promise<DeploymentApproval> {
    const approval = await this.approvalRepo.findOne({ where: { id: approvalId } });
    if (!approval) throw new NotFoundException('Approval not found');

    approval.status = dto.status as ApprovalStatus;
    approval.reviewer = dto.reviewerId;
    approval.reviewerName = dto.reviewerName;
    approval.notes = dto.notes ?? null;
    approval.resolvedAt = new Date();
    await this.approvalRepo.save(approval);

    const deployment = await this.findOne(approval.deploymentId);
    deployment.approvalStatus = dto.status as Deployment['approvalStatus'];
    deployment.approvedBy = dto.status === 'approved' ? dto.reviewerId : null;
    deployment.approvedAt = dto.status === 'approved' ? new Date() : null;
    deployment.status = dto.status === 'approved' ? DeploymentStatus.BUILDING : DeploymentStatus.CANCELLED;
    await this.deploymentRepo.save(deployment);

    return approval;
  }

  // ── Metrics, search, history, promotion ──────────────────────
  // These reuse the Postgres functions already defined in
  // deployments_migration.sql / deployments_v2_migration.sql via raw
  // queries, rather than reimplementing the same aggregation/search/
  // promotion logic in TypeScript — same approach used for
  // get_inquiry_stats and the proposal_number trigger elsewhere.

  async getMetrics(daysBack = 30): Promise<Record<string, unknown>> {
    const [row] = await this.dataSource.query('SELECT get_deployment_metrics($1) AS result', [daysBack]);
    return row?.result ?? {};
  }

  async getTodaySummary(): Promise<Record<string, unknown>> {
    const [row] = await this.dataSource.query('SELECT get_today_deployment_summary() AS result');
    return row?.result ?? {};
  }

  async search(dto: SearchDeploymentsDto): Promise<Record<string, unknown>> {
    const [row] = await this.dataSource.query(
      'SELECT search_deployments($1, $2, $3, $4, $5, $6, $7, $8) AS result',
      [
        dto.query ?? null,
        dto.status ?? null,
        dto.projectId ?? null,
        dto.environmentId ?? null,
        dto.dateFrom ?? null,
        dto.dateTo ?? null,
        dto.page ?? 1,
        dto.pageSize ?? 20,
      ],
    );
    return row?.result ?? {};
  }

  async getHistory(projectId?: string, page = 1, perPage = 20): Promise<Record<string, unknown>> {
    const [row] = await this.dataSource.query(
      'SELECT get_deployment_history($1, $2, $3) AS result',
      [projectId ?? null, page, perPage],
    );
    return row?.result ?? {};
  }

  async promote(
    sourceDeploymentId: string,
    targetEnvironmentId: string,
    promoterId: string,
  ): Promise<Record<string, unknown>> {
    const [row] = await this.dataSource.query(
      'SELECT promote_deployment($1, $2, $3) AS result',
      [sourceDeploymentId, targetEnvironmentId, promoterId],
    );
    return row?.result ?? {};
  }

  // ── Misc ──────────────────────────────────────────────────────

  /** Distinct (project_id, project_name) pairs for filter dropdowns. */
  async getDeploymentProjects(): Promise<Array<{ project_id: string; project_name: string }>> {
    const rows = await this.dataSource.query(
      `SELECT DISTINCT ON (project_id) project_id, project_name
       FROM deployments
       WHERE deleted_at IS NULL AND project_id IS NOT NULL
       ORDER BY project_id, project_name ASC`,
    );
    return rows;
  }

  async getWithDetails(id: string): Promise<Deployment & { logs: DeploymentLog[]; approvals: DeploymentApproval[] }> {
    const [deployment, logs, approvals] = await Promise.all([
      this.findOne(id),
      this.getLogs(id),
      this.getApprovals(id),
    ]);
    return { ...deployment, logs, approvals };
  }
}
