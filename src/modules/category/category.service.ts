import { Injectable } from '@nestjs/common';
import { PrismaService } from '@db/prisma.service';
import type { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        title: createCategoryDto.title,
        priority: createCategoryDto.priority ? Number(createCategoryDto.priority) : null,
      },
    });
    return { message: 'دسته بندی با موفقیت ساخته شد', data: category };
  }
}
