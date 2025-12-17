import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';


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

  @Get('users')
async users() {
  return this.prisma.client.user.findMany()
}
}
