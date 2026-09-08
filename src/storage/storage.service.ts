import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

export interface StoredFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrlBase: string;
  private readonly accessKeyId?: string;
  private readonly secretAccessKey?: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('S3_BUCKET') ?? '';
    this.accessKeyId = this.config.get<string>('S3_ACCESS_KEY_ID');
    this.secretAccessKey = this.config.get<string>('S3_SECRET_ACCESS_KEY');
    const endpoint =
      this.config.get<string>('S3_ENDPOINT') ??
      'https://storage.yandexcloud.net';
    const region = this.config.get<string>('S3_REGION') ?? 'ru-central1';

    this.publicUrlBase = this.bucket
      ? `https://${this.bucket}.storage.yandexcloud.net`
      : '';

    this.client = new S3Client({
      endpoint,
      region,
      forcePathStyle: false,
      credentials: {
        accessKeyId: this.accessKeyId ?? '',
        secretAccessKey: this.secretAccessKey ?? '',
      },
    });
  }

  private get isConfigured(): boolean {
    return Boolean(this.bucket && this.accessKeyId && this.secretAccessKey);
  }

  async upload(file: StoredFile): Promise<string> {
    if (!this.isConfigured) {
      throw new InternalServerErrorException(
        'Хранилище не настроено: укажите S3_BUCKET, S3_ACCESS_KEY_ID и S3_SECRET_ACCESS_KEY',
      );
    }

    const ext = extname(file.originalname) || '';
    const key = `books/${randomUUID()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${this.publicUrlBase}/${key}`;
  }

  async delete(url: string): Promise<void> {
    if (!this.isConfigured) return;

    const prefix = `${this.publicUrlBase}/`;
    if (!url.startsWith(prefix)) return;

    const key = url.slice(prefix.length);
    if (!key) return;

    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
