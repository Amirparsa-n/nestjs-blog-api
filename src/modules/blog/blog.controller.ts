import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from '../../common/enums/swagger-consumes.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';

@Controller('blog')
@ApiTags('Blog')
@ApiBearerAuth('auth')
@UseGuards(AuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiConsumes(SwaggerConsumes.MULTIPART)
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
