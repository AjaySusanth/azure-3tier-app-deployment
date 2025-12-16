import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private prisma: PrismaClient | null = null;

  constructor(private configService: ConfigService) {
    const connectionString =
      this.configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      this.logger.warn(
        'DATABASE_URL not set. Prisma disabled.',
      );
      return;
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    this.prisma = new PrismaClient({ adapter });
    this.logger.log('Prisma client created.');
  }

  async onModuleInit() {
    if (!this.prisma) return;

    try {
      await this.prisma.$connect();
      this.logger.log('Database connected.');
    } catch (err) {
      this.logger.error('Database connection failed', err);
      throw err;
    }
  }

  async onModuleDestroy() {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Safe accessor
   */
  get client(): PrismaClient {
    if (!this.prisma) {
      throw new Error(
        'Prisma is not enabled. DATABASE_URL is missing.',
      );
    }
    return this.prisma;
  }
}
