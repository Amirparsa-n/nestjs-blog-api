import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { CreateBlogCommentDto } from '../dto/comment.dto.js';
import { BlogCommentService } from '../services/comment.service.js';
import { Pagination } from '../../../common/decorators/pagination.decorator.js';
import { PaginationDto } from '../../../common/dtos/pagination.dto.js';

@Controller('blog-comment')
@ApiTags('Blog Comment')
@ApiBearerAuth('auth')
@UseGuards(AuthGuard)
export class BlogCommentController {
  constructor(private readonly commentService: BlogCommentService) {}

  @Post()
  create(@Body() dto: CreateBlogCommentDto) {
    return this.commentService.create(dto);
  }

  @Get()
  @Pagination()
  list(@Query() paginationDto: PaginationDto) {
    return this.commentService.findAll(paginationDto);
  }
}
