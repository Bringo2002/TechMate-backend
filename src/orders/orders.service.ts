import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Deliverable } from '../projects/entities/deliverable.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Deliverable)
    private readonly deliverableRepo: Repository<Deliverable>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepo.create(dto);
    return this.orderRepo.save(order);
  }

  async findAll(userId?: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { ...(userId ? { userId } : {}), deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return this.orderRepo.save(order);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.update(id, { status } as UpdateOrderDto);
  }

  async remove(id: string): Promise<{ message: string }> {
    const order = await this.findOne(id);
    order.deletedAt = new Date();
    await this.orderRepo.save(order);
    return { message: 'Order deleted successfully' };
  }

  /**
   * Deliverables use the same entity/table Projects already registered —
   * an order and a project can each own deliverables independently
   * (both order_id and project_id are nullable FKs on that table).
   */
  async getDeliverables(orderId: string): Promise<Deliverable[]> {
    return this.deliverableRepo.find({
      where: { orderId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /** Matches the frontend's getOrderStats shape exactly. */
  async getStats(userId?: string) {
    const orders = await this.orderRepo.find({
      where: { ...(userId ? { userId } : {}), deletedAt: IsNull() },
      select: ['status', 'spent', 'budget'],
    });

    return {
      total: orders.length,
      active: orders.filter(
        (o) => o.status === OrderStatus.IN_PROGRESS || o.status === OrderStatus.REVIEW,
      ).length,
      completed: orders.filter((o) => o.status === OrderStatus.COMPLETED).length,
      totalSpent: orders.reduce((sum, o) => sum + Number(o.spent ?? 0), 0),
      totalBudget: orders.reduce((sum, o) => sum + Number(o.budget ?? 0), 0),
    };
  }
}
