import { Inject, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { generateSlug } from '../../utils/generateSlug.js';
import { PrismaService } from '../../db/prisma.service.js';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { BlogStatus } from './enum/status.enum.js';
import { Message } from '../../common/enums/message.enum.js';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    const user = this.request.user;

    const { title, content, description, image } = createBlogDto;

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
      },
    });

    return { message: Message.Created, data: blog };
  }

  async getMyBlogs() {
    const user = this.request.user;

    return await this.prisma.blog.findMany({ where: { authorId: user.id }, orderBy: { id: 'desc' } });
  }

  findAll() {
    return `This action returns all blog`;
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
