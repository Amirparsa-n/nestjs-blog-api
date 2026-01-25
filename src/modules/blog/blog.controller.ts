import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from '../../common/enums/swagger-consumes.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../../common/dtos/pagination.dto.js';
import { SkipAuth } from '../../common/decorators/skipAuth.decorator.js';
import { Pagination } from '../../common/decorators/pagination.decorator.js';

@Controller('blog')
@ApiTags('Blog')
@ApiBearerAuth('auth')
@UseGuards(AuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiConsumes(SwaggerConsumes.MULTIPART)
  @UseInterceptors(FileInterceptor('image'))
  create(@UploadedFile() image: Express.Multer.File, @Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Get('/my')
  myBlogs() {
    return this.blogService.getMyBlogs();
  }

  @Get()
  @SkipAuth()
  @Pagination()
  @ApiQuery({ name: 'categoryId', nullable: true, required: false })
  @ApiQuery({ name: 'search', nullable: true, required: false })
  findAll(@Query() paginationDto: PaginationDto, @Query() filterBlogDto: FilterBlogDto) {
    return this.blogService.findAll(paginationDto, filterBlogDto);
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.remove(id);
  }
}
