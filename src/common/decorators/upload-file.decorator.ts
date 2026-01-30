// decorators/upload-file.decorator.ts
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { SwaggerConsumes } from '../enums/swagger-consumes.js';
import { multerStorage } from '../../utils/multer.util.js';

export function UploadFile(fieldName: string = 'image', folderName: string = 'uploads', fieldSize: number = 10) {
  return applyDecorators(
    ApiConsumes(SwaggerConsumes.MULTIPART),
    UseInterceptors(
      FileInterceptor(fieldName, { storage: multerStorage(folderName), limits: { fieldSize: fieldSize * 1024 * 1024 } })
    )
  );
}
