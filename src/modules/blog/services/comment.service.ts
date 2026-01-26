import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service.js';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { BlogService } from './blog.service.js';
import { CreateBlogCommentDto } from '../dto/comment.dto.js';
import { PaginationDto } from '../../../common/dtos/pagination.dto.js';
import { paginationResponse, paginationSolver } from '../../../utils/pagination.js';
import { BlogCommentWhereInput } from '../../../../generated/prisma/models.js';

@Injectable()
export class BlogCommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blogService: BlogService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  async create(createBlogCommentDto: CreateBlogCommentDto) {
    const user = this.request.user;

    const { parentId, blogId, text } = createBlogCommentDto;

    const existBlog = await this.blogService.existsBlogById(blogId);
    if (!existBlog) throw new NotFoundException('بلاگ یافت نشد');

    let parent;
    if (parentId) {
      parent = await this.prisma.blogComment.findFirst({ where: { id: parentId } });

      if (!parent) throw new NotFoundException('کامنت یافت نشد');
    }

    const comment = await this.prisma.blogComment.create({
      data: { text, blogId, parentId: parent ? parentId : null, accepted: true, userId: user.id },
    });

    return { message: 'نظر شما با موفقیت ثبت شد', data: comment };
  }

  async findAll(paginationDto: PaginationDto) {
    const { take, skip, page } = paginationSolver(paginationDto);

    const where: BlogCommentWhereInput = { parentId: null };

    const count = await this.prisma.blogComment.count({ where });

    const blogComments = await this.prisma.blogComment.findMany({
      skip,
      take,
      where,
      include: {
        user: { select: { id: true, phone: true, username: true, name: true, profile: true } },
        children: true,
      },
    });

    return paginationResponse({
      count,
      page,
      take,
      data: blogComments,
    });
  }
}
