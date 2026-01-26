import { Module } from '@nestjs/common';
import { BlogService } from './services/blog.service';
import { BlogController } from './controllers/blog.controller';
import { AuthModule } from '../auth/auth.module.js';
import { CategoryService } from '../category/category.service.js';
import { BlogCommentService } from './services/comment.service.js';
import { BlogCommentController } from './controllers/comment.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [BlogController, BlogCommentController],
  providers: [BlogService, CategoryService, BlogCommentService],
})
export class BlogModule {}
