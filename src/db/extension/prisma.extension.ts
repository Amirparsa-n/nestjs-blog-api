import { Prisma } from '@prisma/client/extension';

export const fileUrlExtension = Prisma.defineExtension({
  name: 'file-url',
  result: {
    file: {
      url: {
        needs: { path: true },
        compute(file) {
          const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
          let cleanPath = file.path
            .replace(/^public[\\/]/, '') // حذف public/ یا public\
            .replace(/\\/g, '/'); // تبدیل \ به /
          cleanPath = cleanPath.replace(/^\/+/, '');
          return `${baseUrl}/${cleanPath}`;
        },
      },
    },
  },
});
