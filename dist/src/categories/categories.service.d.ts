import { PrismaService } from '../prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<any[]>;
    findAllFlat(userId: string): Promise<any>;
    findOne(userId: string, id: string): Promise<any>;
    create(userId: string, dto: CreateCategoryDto): Promise<any>;
    createMany(userId: string, dtos: CreateCategoryDto[]): Promise<any>;
    update(userId: string, id: string, dto: UpdateCategoryDto): Promise<any>;
    remove(userId: string, id: string): Promise<any>;
}
