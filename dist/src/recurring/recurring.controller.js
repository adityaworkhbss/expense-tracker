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
exports.RecurringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recurring_service_1 = require("./recurring.service");
const recurring_dto_1 = require("./dto/recurring.dto");
const common_2 = require("../common");
let RecurringController = class RecurringController {
    recurringService;
    constructor(recurringService) {
        this.recurringService = recurringService;
    }
    findAll(userId) {
        return this.recurringService.findAll(userId);
    }
    create(userId, dto) {
        return this.recurringService.create(userId, dto);
    }
    update(userId, id, dto) {
        return this.recurringService.update(userId, id, dto);
    }
    remove(userId, id) {
        return this.recurringService.remove(userId, id);
    }
};
exports.RecurringController = RecurringController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all recurring transactions' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a recurring transaction' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, recurring_dto_1.CreateRecurringDto]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a recurring transaction' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, recurring_dto_1.UpdateRecurringDto]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a recurring transaction' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "remove", null);
exports.RecurringController = RecurringController = __decorate([
    (0, swagger_1.ApiTags)('Recurring Transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('recurring-transactions'),
    __metadata("design:paramtypes", [recurring_service_1.RecurringService])
], RecurringController);
//# sourceMappingURL=recurring.controller.js.map