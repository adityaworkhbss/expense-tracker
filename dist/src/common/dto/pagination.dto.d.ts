export declare class PaginationDto {
    page: number;
    limit: number;
    get skip(): number;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare function paginate<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T>;
