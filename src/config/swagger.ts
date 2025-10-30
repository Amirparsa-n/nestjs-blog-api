import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function SwaggerConfigInit(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('NestJS Blog App')
    .setDescription('The NestJS Blog API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, documentFactory);
}
