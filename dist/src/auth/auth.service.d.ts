import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';
export interface JwtPayload {
    sub: string;
    email: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private googleClient;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    googleAuth(idToken: string): Promise<AuthTokens & {
        user: any;
    }>;
    refreshTokens(refreshToken: string): Promise<AuthTokens>;
    logout(refreshToken: string): Promise<void>;
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, data: {
        name?: string;
        timezone?: string;
        currency?: string;
    }): Promise<any>;
    validateUser(payload: JwtPayload): Promise<any>;
    incrementOnboardingCount(userId: string): Promise<any>;
    private generateTokens;
}
