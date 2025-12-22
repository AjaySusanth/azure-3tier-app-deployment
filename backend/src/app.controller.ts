import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { logger } from './logger/logger';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('health')
  health() {
    return { status: 'ok', message: 'backend running v6' };
  }

  @Get('ready')
  async ready() {
    try {
      await this.prisma.client.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch (error) {
      throw new Error('Databse not ready');
    }
  }

  @Get('users')
  async users(@Req() req) {
    logger.info({
    requestId: req['requestId'],
    route: '/users',
    message: 'Fetching users',
  });
    return this.prisma.client.user.findMany();
  }
}
