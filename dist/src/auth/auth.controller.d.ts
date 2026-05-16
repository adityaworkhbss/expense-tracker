import * as express from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthDto, UpdateProfileDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    googleAuth(dto: GoogleAuthDto, res: express.Response): Promise<{
        user: any;
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>> | {
        message: string;
        accessToken: string;
        refreshToken: string;
    }>;
    logout(req: express.Request, res: express.Response): Promise<{
        message: string;
    }>;
    me(userId: string): Promise<any>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<any>;
    incrementOnboardingCount(userId: string): Promise<any>;
}
