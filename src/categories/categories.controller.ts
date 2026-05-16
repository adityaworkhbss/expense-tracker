import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CurrentUser } from '../common';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories (tree structure)' })
  @ApiQuery({ name: 'user_id', required: false, description: 'User ID to filter categories' })
  findAll(
    @CurrentUser('id') currentUserId: string,
    @Query('user_id') queryUserId?: string,
  ) {
    const userId = queryUserId || currentUserId;
    return this.categoriesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create category (single or bulk)' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCategoryDto | CreateCategoryDto[],
  ) {
    if (Array.isArray(dto)) {
      return this.categoriesService.createMany(userId, dto);
    }
    return this.categoriesService.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or deactivate a category' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.categoriesService.remove(userId, id);
  }
}
