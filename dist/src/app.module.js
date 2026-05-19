"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const transactions_module_1 = require("./transactions/transactions.module");
const budgets_module_1 = require("./budgets/budgets.module");
const analytics_module_1 = require("./analytics/analytics.module");
const recurring_module_1 = require("./recurring/recurring.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const credit_cards_module_1 = require("./credit-cards/credit-cards.module");
const emis_module_1 = require("./emis/emis.module");
const obligations_module_1 = require("./obligations/obligations.module");
const categories_module_1 = require("./categories/categories.module");
const accounts_module_1 = require("./accounts/accounts.module");
const user_customization_module_1 = require("./user-customization/user-customization.module");
const parse_transaction_module_1 = require("./parse-transaction/parse-transaction.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            transactions_module_1.TransactionsModule,
            budgets_module_1.BudgetsModule,
            analytics_module_1.AnalyticsModule,
            recurring_module_1.RecurringModule,
            credit_cards_module_1.CreditCardsModule,
            emis_module_1.EmisModule,
            obligations_module_1.ObligationsModule,
            categories_module_1.CategoriesModule,
            accounts_module_1.AccountsModule,
            user_customization_module_1.UserCustomizationModule,
            parse_transaction_module_1.ParseTransactionModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map