import { EmisService } from './emis.service';
import { CreateEmiDto, UpdateEmiDto } from './dto/emi.dto';
export declare class EmisController {
    private readonly emisService;
    constructor(emisService: EmisService);
    create(req: any, dto: CreateEmiDto | CreateEmiDto[]): Promise<any>;
    findAll(req: any): Promise<any[]>;
    findOne(req: any, id: string): Promise<any>;
    update(req: any, id: string, updateEmiDto: UpdateEmiDto): Promise<any>;
    remove(req: any, id: string): Promise<any>;
}
