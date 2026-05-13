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
exports.UpdateEmiDto = exports.CreateEmiDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateEmiDto {
    name;
    accountId;
    transactionId;
    principal;
    tenure;
    monthlyEmi;
    startDate;
    nextDueDate;
}
exports.CreateEmiDto = CreateEmiDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Home Loan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmiDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'account-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmiDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'transaction-uuid', description: 'Original transaction if any' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmiDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateEmiDto.prototype, "principal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 60, description: 'Tenure in months' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateEmiDto.prototype, "tenure", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10000, description: 'Monthly EMI amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateEmiDto.prototype, "monthlyEmi", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-05' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmiDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-06-05' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmiDto.prototype, "nextDueDate", void 0);
class UpdateEmiDto {
    name;
    monthlyEmi;
    nextDueDate;
    active;
}
exports.UpdateEmiDto = UpdateEmiDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Home Loan Update' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEmiDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateEmiDto.prototype, "monthlyEmi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-07-05' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEmiDto.prototype, "nextDueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateEmiDto.prototype, "active", void 0);
//# sourceMappingURL=emi.dto.js.map