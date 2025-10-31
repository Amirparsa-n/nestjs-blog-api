import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import { UsersModule } from './modules/users/users.module';
import configuration from './config/configuration';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: join(process.cwd(), '.env'), load: [configuration] }), UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
