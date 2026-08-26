import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  async create(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepo.create({
      userId,
      serviceId: dto.serviceId,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      notes: dto.notes ?? null,
    });
    return this.bookingRepo.save(booking) as Promise<Booking>;
  }

  async findByUser(userId: string): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { userId },
      relations: ['service'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepo.find({
      relations: ['user', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['user', 'service'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async update(id: string, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    if (dto.scheduledAt) {
      booking.scheduledAt = new Date(dto.scheduledAt);
      delete (dto as any).scheduledAt;
    }
    Object.assign(booking, dto);
    return this.bookingRepo.save(booking);
  }

  async cancel(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = 'CANCELLED' as any;
    return this.bookingRepo.save(booking);
  }
}
