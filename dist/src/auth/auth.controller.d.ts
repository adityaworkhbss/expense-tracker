import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./auth.service").AuthTokens & {
        user: any;
    }>;
    login(dto: LoginDto): Promise<import("./auth.service").AuthTokens & {
        user: any;
    }>;
    refresh(dto: RefreshTokenDto): Promise<import("./auth.service").AuthTokens>;
    logout(dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    me(userId: string): Promise<any>;
}
