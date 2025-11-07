import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function SwaggerConfigInit(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('NestJS Blog App')
    .setDescription('The NestJS Blog API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header', name: 'auth' }, 'auth')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, documentFactory);
}
