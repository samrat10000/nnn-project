import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() body: any) {
        // In a real app, use DTOs here to validate 'body'
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: any) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return this.authService.login(user); // returns { access_token: ... }
    }
}

// Needed imports for the above file to compile (added manually now safely):
import { UnauthorizedException } from '@nestjs/common';
