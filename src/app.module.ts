import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import configuration from './config/configuration';
import { PrismaModule } from '@prisma/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(process.cwd(), '.env'), load: [configuration] }),
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
