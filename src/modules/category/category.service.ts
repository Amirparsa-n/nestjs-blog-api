import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@db/prisma.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { PaginationDto } from '@common/dtos/pagination.dto';
import { paginationResponse, paginationSolver } from 'src/utils/pagination';
import { Message, NotFoundMessage } from '@common/enums/message.enum';
import { isUUID } from 'class-validator';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { priority, title } = createCategoryDto;

    const exists = await this.checkExistByTitle(title);
    if (exists) return { message: 'این دسته بندی قبلا ساخته شده است' };

    const category = await this.prisma.category.create({
      data: {
        title: title,
        priority: priority ? Number(createCategoryDto.priority) : null,
      },
    });
    return { message: 'دسته بندی با موفقیت ساخته شد', data: category };
  }

  async insertByTitle(title: string) {
    return await this.prisma.category.create({ data: { title } });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    const { priority, title } = updateCategoryDto;

    if (priority) category.priority = Number(priority);
    if (title) category.title = title;

    await this.prisma.category.update({ where: { id }, data: category });

    return {
      message: Message.Updated,
      category,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { take, skip, page } = paginationSolver(paginationDto);
    console.log('🚀 ~ CategoryService ~ findAll ~ skip:', skip);

    const count = await this.prisma.category.count();

    const categories = await this.prisma.category.findMany({
      skip,
      take,
    });

    return paginationResponse({
      count,
      page,
      take,
      data: categories,
    });
  }

  async findOne(id: string) {
    if (!isUUID(id)) throw new NotFoundException(NotFoundMessage.NotFound);

    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) throw new NotFoundException(NotFoundMessage.NotFound);

    return category;
  }
  async findByTitle(title: string) {
    const category = await this.prisma.category.findFirst({ where: { title } });
    return category;
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    await this.prisma.category.delete({ where: { id: category.id } });

    return { message: Message.Deleted };
  }

  async checkExistByTitle(title?: string) {
    title = title?.trim()?.toLowerCase();
    const category = await this.prisma.category.findFirst({ where: { title } });
    return !!category;
  }
}
