"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const dayjs_1 = __importDefault(require("dayjs"));
const google_auth_library_1 = require("google-auth-library");
const prisma_1 = require("../prisma");
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    googleClient;
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.config.get('GOOGLE_CLIENT_ID'));
    }
    async googleAuth(idToken) {
        let ticket;
        try {
            ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: this.config.get('GOOGLE_CLIENT_ID'),
            });
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new common_1.UnauthorizedException('Invalid Google token payload');
        }
        const email = payload.email;
        const name = payload.name || 'User';
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash: 'google_auth_only',
                    salaryRules: {
                        create: {
                            salaryDay: this.config.get('DEFAULT_SALARY_DAY', 10),
                            expectedAmount: this.config.get('DEFAULT_SALARY_AMOUNT', 87500),
                        },
                    },
                },
            });
            await this.prisma.account.create({
                data: {
                    userId: user.id,
                    name: 'Main Account',
                    type: 'PAY_NOW',
                    openingBalance: 0,
                    currentBalance: 0,
                }
            });
        }
        const tokens = await this.generateTokens(user.id, user.email);
        return {
            ...tokens,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                timezone: user.timezone,
                currency: user.currency,
            },
        };
    }
    async refreshTokens(refreshToken) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!stored || stored.revoked || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revoked: true },
        });
        return this.generateTokens(stored.user.id, stored.user.email);
    }
    async logout(refreshToken) {
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revoked: true },
        });
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                timezone: true,
                currency: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async updateProfile(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                timezone: true,
                currency: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async validateUser(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, name: true, timezone: true, currency: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
    async generateTokens(userId, email) {
        const payload = { sub: userId, email };
        const accessToken = this.jwt.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
        });
        const refreshToken = (0, uuid_1.v4)();
        const refreshExpiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d');
        const expiresAt = (0, dayjs_1.default)()
            .add(parseInt(refreshExpiresIn), 'day')
            .toDate();
        await this.prisma.refreshToken.create({
            data: {
                userId,
                token: refreshToken,
                expiresAt,
            },
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map