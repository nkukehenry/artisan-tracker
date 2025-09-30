import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
      tenantId: string;
    };
    file?: Express.Multer.File;
  }
}
