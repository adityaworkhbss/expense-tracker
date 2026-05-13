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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
const common_2 = require("../common");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getExcelDashboard(userId) {
        return this.analyticsService.getExcelDashboard(userId);
    }
    getSummary(userId) {
        return this.analyticsService.getSummary(userId);
    }
    getDaily(userId, from, to) {
        return this.analyticsService.getDaily(userId, from, to);
    }
    getWeekly(userId, from, to) {
        return this.analyticsService.getWeekly(userId, from, to);
    }
    getMonthly(userId, from, to) {
        return this.analyticsService.getMonthly(userId, from, to);
    }
    getCategoryWise(userId, from, to) {
        return this.analyticsService.getCategoryWise(userId, from, to);
    }
    getCashflow(userId, from, to) {
        return this.analyticsService.getCashflow(userId, from, to);
    }
    getCurrentSalaryCycle(userId) {
        return this.analyticsService.getCurrentSalaryCycle(userId);
    }
    getSalaryCycleHistory(userId) {
        return this.analyticsService.getSalaryCycleHistory(userId);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('excel-dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive Excel-like dashboard summary' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getExcelDashboard", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get overall summary: today, week, month, salary-cycle totals' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('daily'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily totals for a date range' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true, example: '2026-04-01' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true, example: '2026-05-12' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDaily", null);
__decorate([
    (0, common_1.Get)('weekly'),
    (0, swagger_1.ApiOperation)({ summary: 'Get weekly totals for a date range' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getWeekly", null);
__decorate([
    (0, common_1.Get)('monthly'),
    (0, swagger_1.ApiOperation)({ summary: 'Get monthly totals for a date range' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getMonthly", null);
__decorate([
    (0, common_1.Get)('category-wise'),
    (0, swagger_1.ApiOperation)({ summary: 'Get category-wise expense totals' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCategoryWise", null);
__decorate([
    (0, common_1.Get)('cashflow'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cashflow (income vs expense) over time' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCashflow", null);
__decorate([
    (0, common_1.Get)('salary-cycle/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current salary cycle analytics' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCurrentSalaryCycle", null);
__decorate([
    (0, common_1.Get)('salary-cycle/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get salary cycle history (last 12 cycles)' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getSalaryCycleHistory", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map