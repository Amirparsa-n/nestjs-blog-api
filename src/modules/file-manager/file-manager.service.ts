import fs from 'node:fs';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service.js';
import { UploadFileDto } from './dto/update-file.dto.js';
import { FileCategory } from './enums/file-category.enum.js';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { Message } from '../../common/enums/message.enum.js';
import { FileFilterDto } from './dto/file-query.dto.js';
import { PaginationDto } from '../../common/dtos/pagination.dto.js';
import { paginationResponse, paginationSolver } from '../../utils/pagination.js';
import { FileWhereInput } from '../../../generated/prisma/models.js';

@Injectable()
export class FileManagerService {
  private readonly baseUploadsUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request
  ) {
    this.baseUploadsUrl = `${this.request.protocol}://${this.request.get('host')}/uploads`;
  }

  async create(file: Express.Multer.File, body: UploadFileDto) {
    const user = this.request.user;
    const { category, description } = body;

    const fileCategory = category || this.detectCategory(file.mimetype);

    const createdFile = await this.prisma.file.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        category: fileCategory,
        description,
        userId: user.id,
      },
    });

    const fileWithUrl = this.addUrlToFile(createdFile);

    return { message: Message.Created, data: fileWithUrl };
  }

  async findAll(paginationDto: PaginationDto, filters: FileFilterDto) {
    const { category, search, userId, orderBy } = filters;
    const { take, skip, page } = paginationSolver(paginationDto);

    const where: FileWhereInput = { deletedAt: { not: null } };

    if (category) {
      where.category = category;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [files, count] = await Promise.all([
      this.prisma.file.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: orderBy },
      }),
      this.prisma.file.count({ where }),
    ]);

    return paginationResponse({
      count,
      page,
      take,
      data: files.map((file) => this.addUrlToFile(file)),
    });
  }

  async findOne(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: { user: { select: { id: true, username: true, phone: true, name: true } } },
    });
    if (!file) {
      throw new NotFoundException('فایل یافت نشد');
    }
    return this.addUrlToFile(file);
  }

  async remove(id: string) {
    const file = await this.findOne(id);

    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error('Error deleting file from disk:', error);
      throw new BadRequestException('Error deleting file from disk');
    }

    // soft delete
    await this.prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: Message.Deleted };
  }

  private addUrlToFile(file: any, folderName: string = 'file-manager'): any {
    if (!file) return file;

    return {
      ...file,
      url: `${this.baseUploadsUrl}/${folderName}/${file.filename}`,
    };
  }

  private detectCategory(mimeType: string): FileCategory {
    if (mimeType.startsWith('image/')) {
      return FileCategory.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return FileCategory.VIDEO;
    } else if (mimeType.startsWith('audio/')) {
      return FileCategory.AUDIO;
    } else if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
      ].includes(mimeType)
    ) {
      return FileCategory.DOCUMENT;
    } else if (
      mimeType.includes('zip') ||
      mimeType.includes('rar') ||
      mimeType.includes('tar') ||
      mimeType.includes('compressed')
    ) {
      return FileCategory.ARCHIVE;
    } else {
      return FileCategory.OTHER;
    }
  }
}
