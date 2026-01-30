import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export function SwaggerConfigInit(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('NestJS Blog App')
    .setDescription('The NestJS Blog API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'auth',
      },
      'auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const theme = new SwaggerTheme();

  SwaggerModule.setup('/swagger', app, document, {
    customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK),
    swaggerOptions: {
      filter: true, // 🔍 سرچ
      persistAuthorization: true,
    },
  });
}
