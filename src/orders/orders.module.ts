import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Deliverable } from '../projects/entities/deliverable.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  // Deliverable is already registered in ProjectsModule too — TypeORM
  // allows the same entity to be registered in multiple modules'
  // forFeature(); each just gets its own repository token in that
  // module's DI scope, no conflict.
  imports: [TypeOrmModule.forFeature([Order, Deliverable])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
