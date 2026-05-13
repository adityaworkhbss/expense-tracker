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
exports.UpdateAccountDto = exports.CreateAccountDto = exports.AccountTypeEnum = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var AccountTypeEnum;
(function (AccountTypeEnum) {
    AccountTypeEnum["PAY_NOW"] = "PAY_NOW";
    AccountTypeEnum["PAY_LATER"] = "PAY_LATER";
})(AccountTypeEnum || (exports.AccountTypeEnum = AccountTypeEnum = {}));
class CreateAccountDto {
    name;
    type;
    openingBalance;
}
exports.CreateAccountDto = CreateAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HDFC Bank' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAccountDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: AccountTypeEnum, example: 'BANK' }),
    (0, class_validator_1.IsEnum)(AccountTypeEnum),
    __metadata("design:type", String)
], CreateAccountDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5000.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], CreateAccountDto.prototype, "openingBalance", void 0);
class UpdateAccountDto {
    name;
    type;
    isActive;
}
exports.UpdateAccountDto = UpdateAccountDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'HDFC Savings' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAccountDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: AccountTypeEnum }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AccountTypeEnum),
    __metadata("design:type", String)
], UpdateAccountDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAccountDto.prototype, "isActive", void 0);
//# sourceMappingURL=account.dto.js.map