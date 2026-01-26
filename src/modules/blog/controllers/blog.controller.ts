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
import { BlogService } from '../services/blog.service';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from '../dto/blog.dto';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from '../../../common/enums/swagger-consumes.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../../../common/dtos/pagination.dto.js';
import { SkipAuth } from '../../../common/decorators/skipAuth.decorator.js';
import { Pagination } from '../../../common/decorators/pagination.decorator.js';
import { multerStorage } from '../../../utils/multer.util.js';

@Controller('blog')
@ApiTags('Blog')
@ApiBearerAuth('auth')
@UseGuards(AuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiConsumes(SwaggerConsumes.MULTIPART)
  @UseInterceptors(FileInterceptor('image', { storage: multerStorage('user-profile') }))
  create(@UploadedFile() image: Express.Multer.File, @Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto, image);
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
  @ApiConsumes(SwaggerConsumes.MULTIPART)
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateBlogDto: UpdateBlogDto
  ) {
    return this.blogService.update(id, updateBlogDto, image);
  }

  @Get('/like/:id')
  likeToggle(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.likeToggle(id);
  }

  @Get('/bookmark/:id')
  bookmarkToggle(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.bookmarkToggle(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.remove(id);
  }
}
