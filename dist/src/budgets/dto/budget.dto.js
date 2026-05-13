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
exports.UpdateBudgetDto = exports.CreateBudgetDto = exports.BudgetPeriodEnum = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var BudgetPeriodEnum;
(function (BudgetPeriodEnum) {
    BudgetPeriodEnum["WEEKLY"] = "WEEKLY";
    BudgetPeriodEnum["MONTHLY"] = "MONTHLY";
    BudgetPeriodEnum["SALARY_CYCLE"] = "SALARY_CYCLE";
    BudgetPeriodEnum["CUSTOM"] = "CUSTOM";
})(BudgetPeriodEnum || (exports.BudgetPeriodEnum = BudgetPeriodEnum = {}));
class CreateBudgetDto {
    categoryId;
    periodType;
    limitAmount;
    startDate;
    endDate;
}
exports.CreateBudgetDto = CreateBudgetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID (null = overall budget)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BudgetPeriodEnum }),
    (0, class_validator_1.IsEnum)(BudgetPeriodEnum),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "periodType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "limitAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-10' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-06-09' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "endDate", void 0);
class UpdateBudgetDto {
    categoryId;
    periodType;
    limitAmount;
    startDate;
    endDate;
}
exports.UpdateBudgetDto = UpdateBudgetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBudgetDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: BudgetPeriodEnum }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(BudgetPeriodEnum),
    __metadata("design:type", String)
], UpdateBudgetDto.prototype, "periodType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], UpdateBudgetDto.prototype, "limitAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBudgetDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBudgetDto.prototype, "endDate", void 0);
//# sourceMappingURL=budget.dto.js.map