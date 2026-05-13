import { ObligationsService } from './obligations.service';
export declare class ObligationsController {
    private readonly obligationsService;
    constructor(obligationsService: ObligationsService);
    getUpcoming(req: any): Promise<{
        totalObligations: number;
        items: any[];
    }>;
}
