import { PrismaService } from '../prisma';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private baseWhere;
    getSummary(userId: string): Promise<{
        dailyExpense: number;
        weeklyExpense: number;
        monthlyExpense: number;
        monthlyIncome: number;
        salaryCycleExpense: number;
        salaryCycleIncome: number;
        salaryCycleNet: number;
        cashflowBalance: number;
        netWorth: number;
        totalLiabilities: any;
        futureObligations: {
            ccBills: any;
            emis: any;
            payLater: any;
            total: any;
        };
        projectedFreeCash: number;
        safeSpendingLimit: number;
        salaryCycleDates: {
            start: Date;
            end: Date;
        };
    }>;
    getDaily(userId: string, from: string, to: string): Promise<any>;
    getWeekly(userId: string, from: string, to: string): Promise<{
        income: number;
        expense: number;
        net: number;
        count: number;
        week: string;
    }[]>;
    getMonthly(userId: string, from: string, to: string): Promise<any>;
    getCategoryWise(userId: string, from: string, to: string): Promise<any>;
    getCashflow(userId: string, from: string, to: string): Promise<{
        date: string;
        income: number;
        expense: number;
        net: number;
    }[]>;
    getCurrentSalaryCycle(userId: string): Promise<{
        cycleStart: Date;
        cycleEnd: Date;
        cycleDay: any;
        totalIncome: number;
        totalExpense: number;
        netSavings: number;
        salaryReceived: number | null;
        expectedSalary: number | null;
        transactionCount: any;
        categoryBreakdown: any;
    }>;
    getSalaryCycleHistory(userId: string): Promise<any[]>;
    getExcelDashboard(userId: string): Promise<{
        fyString: string;
        currentMonthString: string;
        nextMonthString: string;
        ytd: {
            income: number;
            fixedExpenses: number;
            variableExpenses: number;
            totalExpenses: number;
            netSavings: number;
            savingsRate: number;
        };
        currentMonth: {
            income: number;
            fixedExpenses: number;
            variableExpenses: number;
            ccExpensesCurrent: number;
            ccPaymentPrev: number;
            totalExpenses: number;
            netBalance: number;
        };
        nextMonth: {
            expectedIncome: number;
            expectedFixed: any;
            ccPaymentDue: any;
            estTotalExpenses: any;
            estBalance: number;
        };
        insights: {
            fixedVsVariable: number;
            emiPercentOfIncome: number;
            ccVsBankSpending: number;
        };
        fixedMasterList: {
            items: any[];
            totalIncome: any;
            totalExpense: any;
        };
        summary: {
            dailyExpense: number;
            weeklyExpense: number;
            monthlyExpense: number;
            monthlyIncome: number;
            salaryCycleExpense: number;
            salaryCycleIncome: number;
            salaryCycleNet: number;
            cashflowBalance: number;
            netWorth: number;
            totalLiabilities: any;
            futureObligations: {
                ccBills: any;
                emis: any;
                payLater: any;
                total: any;
            };
            projectedFreeCash: number;
            safeSpendingLimit: number;
            salaryCycleDates: {
                start: Date;
                end: Date;
            };
        };
    }>;
    private sumAmount;
    private getCategoryWiseRaw;
    private groupByDate;
}
