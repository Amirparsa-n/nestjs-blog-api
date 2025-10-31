import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.log('Failed to connect to the database', error);
      throw new Error('Database connection error');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
