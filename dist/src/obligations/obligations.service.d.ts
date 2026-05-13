import { PrismaService } from '../prisma/prisma.service';
export declare class ObligationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUpcomingObligations(userId: string): Promise<{
        totalObligations: number;
        items: any[];
    }>;
}
