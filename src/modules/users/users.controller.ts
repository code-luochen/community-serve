import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create user (Admin only)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req: any, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Upload user avatar' })
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: any, // Express.Multer.File
  ) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.usersService.update(user.id, { avatar: avatarUrl });
    return { url: avatarUrl };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: any, @Body() updateDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users (Admin only)' })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.update(id, { status: statusDto.status });
  }

  @Post(':id/reset-password')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reset user password (Admin only)' })
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.resetPassword(id, '123456');
    return { message: 'Password reset to 123456' };
  }
}
