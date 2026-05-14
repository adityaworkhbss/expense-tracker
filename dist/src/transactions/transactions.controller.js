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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transactions_service_1 = require("./transactions.service");
const transaction_dto_1 = require("./dto/transaction.dto");
const common_2 = require("../common");
const dayjs_1 = __importDefault(require("dayjs"));
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    findAll(userId, query) {
        return this.transactionsService.findAll(userId, query);
    }
    async exportCsv(userId, from, to, res) {
        const data = await this.transactionsService.getExportData(userId, from, to);
        const csv = [
            'Date,Type,Category,Account,Amount,Note,Merchant,Status,Is Salary',
            ...data.map(tx => [
                (0, dayjs_1.default)(tx.transactionDate).format('YYYY-MM-DD HH:mm:ss'), tx.type,
                tx.category?.name || '', tx.account?.name || '', tx.amount.toString(),
                `"${(tx.note || '').replace(/"/g, '""')}"`, tx.merchant || '', tx.status, tx.isSalary,
            ].join(',')),
        ].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=transactions_${(0, dayjs_1.default)().format('YYYY-MM-DD')}.csv`);
        res.send(csv);
    }
    async exportXlsx(userId, from, to, res) {
        const ExcelJS = await import('exceljs');
        const data = await this.transactionsService.getExportData(userId, from, to);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Transactions');
        sheet.columns = [
            { header: 'Date', key: 'date', width: 20 }, { header: 'Type', key: 'type', width: 12 },
            { header: 'Category', key: 'category', width: 18 }, { header: 'Account', key: 'account', width: 18 },
            { header: 'Amount', key: 'amount', width: 15 }, { header: 'Note', key: 'note', width: 30 },
            { header: 'Status', key: 'status', width: 12 },
        ];
        for (const tx of data) {
            sheet.addRow({
                date: (0, dayjs_1.default)(tx.transactionDate).format('YYYY-MM-DD HH:mm:ss'), type: tx.type,
                category: tx.category?.name || '', account: tx.account?.name || '',
                amount: Number(tx.amount), note: tx.note || '', status: tx.status,
            });
        }
        sheet.getRow(1).font = { bold: true };
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=transactions_${(0, dayjs_1.default)().format('YYYY-MM-DD')}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
    create(userId, dto) {
        return this.transactionsService.create(userId, dto);
    }
    importTransactions(userId, transactions) {
        return this.transactionsService.importTransactions(userId, transactions);
    }
    findOne(userId, id) {
        return this.transactionsService.findOne(userId, id);
    }
    update(userId, id, dto) {
        return this.transactionsService.update(userId, id, dto);
    }
    remove(userId, id) {
        return this.transactionsService.remove(userId, id);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List transactions with filters and pagination' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.TransactionQueryDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Export transactions as CSV' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/xlsx'),
    (0, swagger_1.ApiOperation)({ summary: 'Export transactions as XLSX' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "exportXlsx", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a transaction' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Import transactions from JSON array' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "importTransactions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single transaction' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a transaction' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a transaction' }),
    __param(0, (0, common_2.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "remove", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map