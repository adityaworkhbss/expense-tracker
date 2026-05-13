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
exports.ObligationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const obligations_service_1 = require("./obligations.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ObligationsController = class ObligationsController {
    obligationsService;
    constructor(obligationsService) {
        this.obligationsService = obligationsService;
    }
    getUpcoming(req) {
        return this.obligationsService.getUpcomingObligations(req.user.id);
    }
};
exports.ObligationsController = ObligationsController;
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming liabilities and obligations for next 30 days' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ObligationsController.prototype, "getUpcoming", null);
exports.ObligationsController = ObligationsController = __decorate([
    (0, swagger_1.ApiTags)('Obligations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('obligations'),
    __metadata("design:paramtypes", [obligations_service_1.ObligationsService])
], ObligationsController);
//# sourceMappingURL=obligations.controller.js.map