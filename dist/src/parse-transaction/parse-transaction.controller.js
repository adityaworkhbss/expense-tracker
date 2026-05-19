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
exports.ParseTransactionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const parse_transaction_service_1 = require("./parse-transaction.service");
const parse_transaction_dto_1 = require("./dto/parse-transaction.dto");
const user_customization_service_1 = require("../user-customization/user-customization.service");
const common_2 = require("../common");
let ParseTransactionController = class ParseTransactionController {
    parseService;
    customizationService;
    constructor(parseService, customizationService) {
        this.parseService = parseService;
        this.customizationService = customizationService;
    }
    async parse(userId, dto) {
        const customization = await this.customizationService.get(userId);
        if (!customization.aiTransaction) {
            throw new common_1.ForbiddenException('AI transaction parsing is not enabled. Enable it in user customization settings.');
        }
        return this.parseService.parseTransaction(userId, dto.text);
    }
};
exports.ParseTransactionController = ParseTransactionController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Parse natural language text into structured transaction data',
        description: 'Accepts raw text like "uber 340 yesterday" and returns structured transaction fields. ' +
            'Requires ai_transaction to be enabled in user customization.',
    }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, parse_transaction_dto_1.ParseTransactionDto]),
    __metadata("design:returntype", Promise)
], ParseTransactionController.prototype, "parse", null);
exports.ParseTransactionController = ParseTransactionController = __decorate([
    (0, swagger_1.ApiTags)('Parse Transaction'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('parse-transaction'),
    __metadata("design:paramtypes", [parse_transaction_service_1.ParseTransactionService,
        user_customization_service_1.UserCustomizationService])
], ParseTransactionController);
//# sourceMappingURL=parse-transaction.controller.js.map