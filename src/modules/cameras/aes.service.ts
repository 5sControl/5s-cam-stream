import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AesService {
  private readonly key: Buffer;
  private readonly algorithm = 'aes-256-ecb';

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.getOrThrow<string>('AES_SECRET_KEY');
    if (!secretKey) {
      throw new Error('AES_SECRET_KEY is not set in environment variables');
    }

    this.key = Buffer.from(secretKey, 'utf8');
    if (this.key.length !== 32) {
      throw new Error(`Invalid key length: ${this.key.length}. Expected 32 bytes for AES-256.`);
    }
  }

  encrypt(plainText: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, null);
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  decrypt(base64Data: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, null);
    decipher.setAutoPadding(true);
    let decrypted = decipher.update(base64Data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
