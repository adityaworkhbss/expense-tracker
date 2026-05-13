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
exports.UpdateRecurringDto = exports.CreateRecurringDto = exports.RecurringTypeEnum = exports.RecurringFrequencyEnum = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var RecurringFrequencyEnum;
(function (RecurringFrequencyEnum) {
    RecurringFrequencyEnum["DAILY"] = "DAILY";
    RecurringFrequencyEnum["WEEKLY"] = "WEEKLY";
    RecurringFrequencyEnum["MONTHLY"] = "MONTHLY";
    RecurringFrequencyEnum["YEARLY"] = "YEARLY";
    RecurringFrequencyEnum["CUSTOM"] = "CUSTOM";
})(RecurringFrequencyEnum || (exports.RecurringFrequencyEnum = RecurringFrequencyEnum = {}));
var RecurringTypeEnum;
(function (RecurringTypeEnum) {
    RecurringTypeEnum["INCOME"] = "INCOME";
    RecurringTypeEnum["EXPENSE"] = "EXPENSE";
    RecurringTypeEnum["TRANSFER"] = "TRANSFER";
})(RecurringTypeEnum || (exports.RecurringTypeEnum = RecurringTypeEnum = {}));
class CreateRecurringDto {
    accountId;
    categoryId;
    type;
    amount;
    frequency;
    nextRunAt;
    endDate;
    note;
}
exports.CreateRecurringDto = CreateRecurringDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecurringDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecurringDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: RecurringTypeEnum }),
    (0, class_validator_1.IsEnum)(RecurringTypeEnum),
    __metadata("design:type", String)
], CreateRecurringDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10000 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], CreateRecurringDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: RecurringFrequencyEnum }),
    (0, class_validator_1.IsEnum)(RecurringFrequencyEnum),
    __metadata("design:type", String)
], CreateRecurringDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRecurringDto.prototype, "nextRunAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRecurringDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecurringDto.prototype, "note", void 0);
class UpdateRecurringDto {
    accountId;
    categoryId;
    type;
    amount;
    frequency;
    nextRunAt;
    endDate;
    active;
    note;
}
exports.UpdateRecurringDto = UpdateRecurringDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: RecurringTypeEnum }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RecurringTypeEnum),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], UpdateRecurringDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: RecurringFrequencyEnum }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RecurringFrequencyEnum),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "nextRunAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRecurringDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "note", void 0);
//# sourceMappingURL=recurring.dto.js.map