import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user._id, role: user.role };

        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        await this.usersService.update(user._id, { refreshTokenHash });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                permissions: user.permissions
            }
        };
    }

    async logout(userId: string) {
        return this.usersService.update(userId, { refreshTokenHash: null });
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.usersService.findById(payload.sub);

            if (!user || !user.refreshTokenHash) {
                throw new UnauthorizedException('Access Denied');
            }

            const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
            if (!isMatch) {
                throw new UnauthorizedException('Access Denied');
            }

            // Reuse login logic to generate new pair and save new hash
            return this.login(user);

        } catch (e) {
            throw new UnauthorizedException('Invalid Refresh Token');
        }
    }

    async register(registrationData: any) {
        const hashedPassword = await bcrypt.hash(registrationData.password, 10);
        const newUser = await this.usersService.create({
            ...registrationData,
            password: hashedPassword,
        });
        // Auto-login after register
        return this.login(newUser);
    }
}
