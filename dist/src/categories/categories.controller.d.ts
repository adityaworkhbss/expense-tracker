import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(userId: string): Promise<any>;
    create(userId: string, dto: CreateCategoryDto | CreateCategoryDto[]): Promise<any>;
    update(userId: string, id: string, dto: UpdateCategoryDto): Promise<any>;
    remove(userId: string, id: string): Promise<any>;
}
