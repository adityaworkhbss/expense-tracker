import { PrismaService } from '../prisma/prisma.service';
import { CreateEmiDto, UpdateEmiDto } from './dto/emi.dto';
export declare class EmisService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateEmiDto): Promise<any>;
    findAll(userId: string): Promise<any[]>;
    findOne(userId: string, id: string): Promise<any>;
    update(userId: string, id: string, dto: UpdateEmiDto): Promise<any>;
    remove(userId: string, id: string): Promise<any>;
}
