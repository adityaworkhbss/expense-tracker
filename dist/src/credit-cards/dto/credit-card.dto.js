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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCreditCardDto = exports.CreateCreditCardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCreditCardDto {
    cardName;
    accountId;
    limit;
    statementDate;
    dueDays;
}
exports.CreateCreditCardDto = CreateCreditCardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HDFC Regalia' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCreditCardDto.prototype, "cardName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-account-id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCreditCardDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCreditCardDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Day of the month for statement generation' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCreditCardDto.prototype, "statementDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20, description: 'Number of days after statement when payment is due' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCreditCardDto.prototype, "dueDays", void 0);
class UpdateCreditCardDto {
    cardName;
    limit;
    statementDate;
    dueDays;
}
exports.UpdateCreditCardDto = UpdateCreditCardDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'HDFC Regalia' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCreditCardDto.prototype, "cardName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 150000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCreditCardDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 15 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCreditCardDto.prototype, "statementDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCreditCardDto.prototype, "dueDays", void 0);
//# sourceMappingURL=credit-card.dto.js.map