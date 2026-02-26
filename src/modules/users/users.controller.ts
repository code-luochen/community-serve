
import { Controller, Post, Body, UseGuards, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

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

    // TODO: Add findAll with pagination

    @Post(':id/reset-password')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Reset user password (Admin only)' })
    async resetPassword(@Param('id', ParseIntPipe) id: number) {
        // Reset to default password (e.g., 123456 or Admin@123)
        // PRD says "Admin reset password". Maybe provide a default? 
        // Or allow admin to specify? 
        // For now, let's reset to '123456' as default temporary.
        await this.usersService.resetPassword(id, '123456');
        return { message: 'Password reset to 123456' };
    }
}
