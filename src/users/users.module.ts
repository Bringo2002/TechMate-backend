import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

/**
 * UsersModule — owns the User entity and exports the repository
 * so other modules (Auth, Messages, etc.) can inject it.
 *
 * Full profile CRUD endpoints will be added in a later chunk.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule], // lets other modules inject Repository<User>
})
export class UsersModule {}
