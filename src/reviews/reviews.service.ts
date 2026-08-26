import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepo.create({
      userId,
      serviceId: dto.serviceId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });
    return this.reviewRepo.save(review) as Promise<Review>;
  }

  async findByService(serviceId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { serviceId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRating(serviceId: string): Promise<{ average: number; count: number }> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.serviceId = :serviceId', { serviceId })
      .getRawOne();

    return {
      average: parseFloat(result?.average ?? '0'),
      count: parseInt(result?.count ?? '0', 10),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewRepo.remove(review);
    return { message: 'Review deleted' };
  }
}
