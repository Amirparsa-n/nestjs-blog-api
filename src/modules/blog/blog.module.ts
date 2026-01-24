import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AuthModule } from '../auth/auth.module.js';
import { CategoryService } from '../category/category.service.js';

@Module({
  imports: [AuthModule],
  controllers: [BlogController],
  providers: [BlogService, CategoryService],
})
export class BlogModule {}
