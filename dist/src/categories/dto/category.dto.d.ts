export declare enum CategoryTypeEnum {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE"
}
export declare class CreateCategoryDto {
    name: string;
    type: CategoryTypeEnum;
    parentId?: string;
    color?: string;
    icon?: string;
}
export declare class UpdateCategoryDto {
    name?: string;
    type?: CategoryTypeEnum;
    parentId?: string | null;
    color?: string;
    icon?: string;
    isActive?: boolean;
}
