import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { generateSlug } from '../../utils/generateSlug.js';
import { PrismaService } from '../../db/prisma.service.js';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { BlogStatus } from './enum/status.enum.js';
import { Message } from '../../common/enums/message.enum.js';
import { PaginationDto } from '../../common/dtos/pagination.dto.js';
import { paginationResponse, paginationSolver } from '../../utils/pagination.js';
import { CategoryService } from '../category/category.service.js';
import { Prisma } from '../../../generated/prisma/browser.js';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  async create(createBlogDto: CreateBlogDto, image: Express.Multer.File) {
    const user = this.request.user;

    const { title, content, description } = createBlogDto;

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
        image: image?.path || '',
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

  async findAll(paginationDto: PaginationDto, filterBlogDto: FilterBlogDto) {
    const { take, skip, page } = paginationSolver(paginationDto);
    const { categoryId, search } = filterBlogDto;

    const andConditions: Prisma.BlogWhereInput[] = [];

    if (categoryId) {
      andConditions.push({
        categories: {
          some: {
            category: { id: { contains: categoryId } },
          },
        },
      });
    }

    // 🔹 Global search
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          {
            categories: {
              some: {
                category: {
                  title: { contains: search, mode: 'insensitive' },
                },
              },
            },
          },
        ],
      });
    }

    const where: Prisma.BlogWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const count = await this.prisma.blog.count({ where });

    const blogs = await this.prisma.blog.findMany({
      skip,
      take,
      where,
      include: {
        categories: { include: { category: true } },
        author: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return paginationResponse({
      count,
      page,
      take,
      data: blogs,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  async update(blogId: string, updateBlogDto: UpdateBlogDto, image: Express.Multer.File) {
    const existingBlog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      include: { categories: { include: { category: true } } },
    });

    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    const data: Prisma.BlogUpdateInput = {};

    if (updateBlogDto.title) {
      data.title = updateBlogDto.title;
    }
    if (updateBlogDto.content) {
      data.content = updateBlogDto.content;
    }
    if (updateBlogDto.description) {
      data.description = updateBlogDto.description;
    }
    if (image) {
      data.image = image.path;
    }
    if (updateBlogDto.status) {
      data.status = updateBlogDto.status;
    }

    // slug: اگر ارسال شده تغییر بده، در غیر اینصورت همان قبلی
    if (updateBlogDto.slug) {
      let newSlug = updateBlogDto.slug;
      const isExistSlug = await this.existsBlogBySlug(newSlug);
      if (isExistSlug && newSlug !== existingBlog.slug) {
        newSlug = `${newSlug}-${Math.random().toString(36).substring(2)}`;
      }
      data.slug = newSlug;
    }

    // دسته‌بندی: اگر ارسال شده، بروزرسانی کن
    if (updateBlogDto.categories) {
      const categories = updateBlogDto.categories.split(',');
      const categoryIds = await Promise.all(
        categories.map(async (title) => {
          const category =
            (await this.categoryService.findByTitle(title)) ?? (await this.categoryService.insertByTitle(title));
          return category.id;
        })
      );

      // حذف همه دسته‌بندی‌های فعلی بلاگ
      await this.prisma.blogCategory.deleteMany({
        where: { blogId },
      });
      // اضافه کردن دسته‌بندی‌های جدید
      data.categories = {
        create: categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      };
    }

    const updatedBlog = await this.prisma.blog.update({
      where: { id: blogId },
      data,
      include: {
        categories: { include: { category: true } },
        author: { select: { id: true, name: true } },
      },
    });

    return { message: Message.Updated, data: updatedBlog };
  }

  async remove(id: string) {
    const existBlog = await this.existsBlogById(id);

    if (!existBlog) throw new NotFoundException('بلاگ یافت نشد');

    await this.prisma.blog.delete({ where: { id } });

    return { message: Message.Deleted };
  }

  async existsBlogBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({ where: { slug } });
    return !!blog;
  }

  async existsBlogById(id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    return !!blog;
  }
}
