import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { UsersService } from './users.service';
import { UpdateProfileDto, AdminUpdateUserDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums';

/**
 * Users controller — profile management
 *
 * GET    /api/users                — list users (filters: role, userType,
 *                                     isActive, search, email; pagination:
 *                                     page, pageSize; sort: sortBy, sortDir)
 * GET    /api/users/profile        — get own profile
 * PUT    /api/users/profile        — update own name/bio/avatarUrl
 * POST   /api/users/profile/avatar — upload avatar image
 * GET    /api/users/:id            — get a specific user by id
 * PUT    /api/users/:id            — admin: update role/userType/isAdmin/isActive
 * DELETE /api/users/:id            — admin: soft-delete a user
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users with optional filters, pagination, and sorting' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'userType', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortDir', required: false })
  async findAll(
    @Query('role') role?: string,
    @Query('userType') userType?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('email') email?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: 'ASC' | 'DESC',
  ) {
    return this.usersService.findAll({
      filters: {
        role,
        userType,
        isActive: isActive === undefined ? undefined : isActive === 'true',
        search,
        email,
      },
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sortBy,
      sortDir,
    });
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: Request & { user: User }) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @Req() req: Request & { user: User },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Post('profile/avatar')
  @ApiOperation({ summary: 'Upload avatar image (JPEG/PNG, max 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { avatar: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${Date.now()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
          cb(new BadRequestException('Only JPEG/PNG allowed'), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async uploadAvatar(
    @Req() req: Request & { user: User },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(req.user.id, avatarUrl);
  }

  @Delete('profile')
  @ApiOperation({ summary: "Delete the current user's own account" })
  async deleteOwnAccount(@Req() req: Request & { user: User }) {
    return this.usersService.softDelete(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  async findOne(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Admin: update a user's role/userType/isAdmin/isActive" })
  async adminUpdate(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.usersService.adminUpdate(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: soft-delete a user' })
  async remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}
