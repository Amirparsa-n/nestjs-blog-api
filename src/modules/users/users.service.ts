import { PrismaService } from '@db/prisma.service';
import { Inject, Injectable, Scope } from '@nestjs/common';
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

  async updateUserProfile(profileDto: ProfileDto, files: any) {
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

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: id }, include: { Profile: true } });

    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
