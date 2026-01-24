import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { generateSlug } from '../../utils/generateSlug.js';

@Injectable()
export class BlogService {
  create(createBlogDto: CreateBlogDto) {
    // let { title } = createBlogDto;

    const slug = createBlogDto.slug ?? generateSlug(createBlogDto.title);
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
}
