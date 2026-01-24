import { Inject, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { generateSlug } from '../../utils/generateSlug.js';
import { PrismaService } from '../../db/prisma.service.js';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { BlogStatus } from './enum/status.enum.js';
import { Message } from '../../common/enums/message.enum.js';
import { PaginationDto } from '../../common/dtos/pagination.dto.js';
import { paginationResponse, paginationSolver } from '../../utils/pagination.js';
import { CategoryService } from '../category/category.service.js';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    const user = this.request.user;

    const { title, content, description, image } = createBlogDto;

    // دریافت دسته بندی به صورت استرینگ با کاما
    const categories = createBlogDto.categories.split(',');

    const categoryIds = await Promise.all(
      categories.map(async (title) => {
        const category =
          (await this.categoryService.findByTitle(title)) ?? (await this.categoryService.insertByTitle(title));
        return category.id;
      })
    );

    let slug = createBlogDto.slug || generateSlug(createBlogDto.title);

    const isExistSlug = await this.existsBlogBySlug(slug);
    if (isExistSlug) {
      slug = `${slug}-${Math.random().toString(36).substring(2)}`;
    }

    const blog = await this.prisma.blog.create({
      data: {
        content,
        description,
        image,
        slug,
        title,
        authorId: user.id,
        status: BlogStatus.Draft,
        created_at: new Date(),
        updated_at: new Date(),

        categories: {
          create: categoryIds.map((categoryId) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return { message: Message.Created, data: blog };
  }

  async getMyBlogs() {
    const user = this.request.user;

    return await this.prisma.blog.findMany({ where: { authorId: user.id }, orderBy: { id: 'desc' } });
  }

  async findAll(paginationDto: PaginationDto) {
    const { take, skip, page } = paginationSolver(paginationDto);

    const count = await this.prisma.blog.count();

    const categories = await this.prisma.blog.findMany({
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

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  update(id: number, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  remove(id: number) {
    return `This action removes a #${id} blog`;
  }

  async existsBlogBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({ where: { slug } });
    return !!blog;
  }
}
