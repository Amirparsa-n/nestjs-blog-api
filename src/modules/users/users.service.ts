import { PrismaService } from '@db/prisma.service';
import { ConflictException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ProfileDto } from './dto/profile.dto';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { mergeUpdateData } from '../../utils/mergeUpdateData.js';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  async updateUserProfile(
    profileDto: ProfileDto,
    files: { avatar: Express.Multer.File[]; bg_image: Express.Multer.File[] }
  ) {
    const user = this.request.user;
    if (!user) return;

    const profile = await this.prisma.profile.findUnique({ where: { userId: user.id } });

    // handle files
    const { avatar, bg_image } = files;
    if (avatar?.length > 0) profileDto.avatar = avatar[0].path;
    if (bg_image?.length > 0) profileDto.bg_image = bg_image[0].path;

    if (profile) {
      const updatedProfile = await this.prisma.profile.update({
        where: { id: profile.id },
        data: mergeUpdateData(profileDto, profile),
        include: { user: true },
      });

      return {
        message: 'پروفایل شما بروز شد',
        data: updatedProfile,
      };
    } else {
      const newProfile = await this.prisma.profile.create({
        data: { ...profileDto, userId: user.id },
        include: { user: true },
      });

      return {
        message: 'پروفایل شما تکمیل شد',
        data: newProfile,
      };
    }
  }

  async getProfile() {
    const user = this.request.user;
    if (!user) return;

    const profile = await this.prisma.profile.findUnique({ where: { userId: user.id }, include: { user: true } });

    return profile;
  }

  async changeUsername(username: string) {
    const user = this.request.user;
    if (!user) return;

    const userData = await this.prisma.user.findUnique({ where: { username: user?.username } });

    if (userData && userData.id !== user.id) {
      throw new ConflictException();
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { username } });

    return { message: 'نام کاربری با موفقیت ویرایش شد' };
  }

  async blockUser(userId: string) {
    const user = await this.findOne(userId);
    if (!user) throw new NotFoundException('کاربر مورد نظر یافت نشد');

    const isBlocked = user.isBlocked;

    await this.prisma.user.update({ where: { id: userId }, data: { isBlocked: !isBlocked } });

    return { message: `کاربر با موفقیت ${isBlocked ? 'رفع بلاک شد' : 'بلاک شد'}` };
  }

  findAll() {
    const users = this.prisma.user.findMany();
    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: id }, include: { profile: true } });

    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
