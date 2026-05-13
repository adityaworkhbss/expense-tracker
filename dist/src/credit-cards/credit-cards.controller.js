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
exports.CreditCardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const credit_cards_service_1 = require("./credit-cards.service");
const credit_card_dto_1 = require("./dto/credit-card.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CreditCardsController = class CreditCardsController {
    creditCardsService;
    constructor(creditCardsService) {
        this.creditCardsService = creditCardsService;
    }
    create(req, createCreditCardDto) {
        return this.creditCardsService.create(req.user.id, createCreditCardDto);
    }
    findAll(req) {
        return this.creditCardsService.findAll(req.user.id);
    }
    findOne(req, id) {
        return this.creditCardsService.findOne(req.user.id, id);
    }
    update(req, id, updateCreditCardDto) {
        return this.creditCardsService.update(req.user.id, id, updateCreditCardDto);
    }
    remove(req, id) {
        return this.creditCardsService.remove(req.user.id, id);
    }
};
exports.CreditCardsController = CreditCardsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new credit card' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, credit_card_dto_1.CreateCreditCardDto]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all credit cards' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get credit card details' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update credit card' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, credit_card_dto_1.UpdateCreditCardDto]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete credit card' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "remove", null);
exports.CreditCardsController = CreditCardsController = __decorate([
    (0, swagger_1.ApiTags)('Credit Cards'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('credit-cards'),
    __metadata("design:paramtypes", [credit_cards_service_1.CreditCardsService])
], CreditCardsController);
//# sourceMappingURL=credit-cards.controller.js.map