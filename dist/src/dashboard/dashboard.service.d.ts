import { PrismaService } from '../prisma';
import { AnalyticsService } from '../analytics/analytics.service';
export declare class DashboardService {
    private readonly prisma;
    private readonly analyticsService;
    constructor(prisma: PrismaService, analyticsService: AnalyticsService);
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
    private sumAmount;
    private getDailyTrend;
}
