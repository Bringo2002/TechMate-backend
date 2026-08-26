import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async create(userId: string, dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepo.create({
      userId,
      amount: dto.amount,
      method: dto.method,
      reference: dto.reference ?? null,
    });
    return this.paymentRepo.save(payment) as Promise<Payment>;
  }

  async findByUser(userId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { userId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { deletedAt: IsNull() },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, dto);
    return this.paymentRepo.save(payment);
  }

  async remove(id: string): Promise<{ message: string }> {
    const payment = await this.findOne(id);
    payment.deletedAt = new Date();
    await this.paymentRepo.save(payment);
    return { message: 'Payment deleted' };
  }
}
