
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new Error('Invalid credentials'); // Or use UnauthorizedException properly in service/filter
        }
        return this.authService.login(user);
    }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'User registration' })
    async register(@Body() createUserDto: LoginDto) { // Reusing LoginDto for simplicity, ideally CreateUserDto
        return this.authService.register(createUserDto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    getProfile(@CurrentUser() user: any) {
        return user;
    }
}
