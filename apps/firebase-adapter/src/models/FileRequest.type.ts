// apps/firebase-adapter/src/models/FileRequest.type.ts
// extends Request type of Express to add file property
import { Request } from 'express';

export interface FileRequest extends Request {
   file: {
      filename: string;
      originalname: string;
      buffer: Buffer;
      mimetype: string;
   };
}
