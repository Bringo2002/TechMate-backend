import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AdminMetric } from './entities/admin-metric.entity';
import { CreateAdminMetricDto } from './dto/admin-metric.dto';

@Injectable()
export class AdminMetricsService {
  constructor(
    @InjectRepository(AdminMetric) private readonly metricRepo: Repository<AdminMetric>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ── Live metrics — reuse the Postgres functions already in the schema ──
  // (functions.sql) rather than reimplementing the same aggregation in
  // TypeScript, same approach used for get_inquiry_stats and the
  // deployment metrics functions.

  async getLiveMetrics(): Promise<Record<string, unknown>> {
    const [row] = await this.dataSource.query('SELECT get_admin_metrics() AS result');
    return row?.result ?? {};
  }

  async getUserGrowth(months = 12): Promise<Array<{ month: string; count: number }>> {
    return this.dataSource.query('SELECT * FROM get_user_growth($1)', [months]);
  }

  async getRevenueByMonth(months = 12): Promise<Array<{ month: string; revenue: number }>> {
    return this.dataSource.query('SELECT * FROM get_revenue_by_month($1)', [months]);
  }

  // ── Daily snapshot table — separate from the live functions above.
  // No scheduled job populates this yet in this backend; these are just
  // the CRUD primitives a future cron/admin action would call.

  async createSnapshot(dto: CreateAdminMetricDto): Promise<AdminMetric> {
    const metric = this.metricRepo.create(dto);
    return this.metricRepo.save(metric);
  }

  async findAll(): Promise<AdminMetric[]> {
    return this.metricRepo.find({ order: { metricDate: 'DESC' } });
  }

  async findLatest(): Promise<AdminMetric | null> {
    const [latest] = await this.metricRepo.find({ order: { metricDate: 'DESC' }, take: 1 });
    return latest ?? null;
  }
}
