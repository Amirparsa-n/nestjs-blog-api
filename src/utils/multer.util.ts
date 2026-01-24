import { Request } from 'express';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';

export function multerDestination(dirName: string) {
  return function (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ) {
    const path = join('public', 'uploads', dirName);
    mkdirSync(path, { recursive: true });
    callback(null, path);
  };
}

export function multerFilename(
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void
) {
  const ext = extname(file.originalname).toLowerCase();
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
}

export function multerStorage(dirName: string) {
  return diskStorage({
    destination: multerDestination(dirName),
    filename: multerFilename,
  });
}
