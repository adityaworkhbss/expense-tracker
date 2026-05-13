import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(userId: string): Promise<{
        summary: {
            totalIncome: number;
            totalExpense: number;
            netBalance: any;
            savingsRate: number;
        };
        periodTotals: {
            daily: {
                income: number;
                expense: number;
                net: number;
            };
            weekly: {
                income: number;
                expense: number;
                net: number;
            };
            monthly: {
                income: number;
                expense: number;
                net: number;
            };
            salaryCycle: {
                income: number;
                expense: number;
                net: number;
                start: Date;
                end: Date;
            };
        };
        accounts: any;
        categoryBreakdown: any;
        topCategories: any;
        recentTransactions: any;
        charts: {
            last7Days: {
                net: number;
                income: number;
                expense: number;
                date: string;
            }[];
            last30Days: {
                net: number;
                income: number;
                expense: number;
                date: string;
            }[];
        };
        transactionCount: any;
    }>;
}
