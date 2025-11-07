import type { User } from 'generated/prisma';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
