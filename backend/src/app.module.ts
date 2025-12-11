import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the variables available globally
      // Optional: specify the path to your .env file
      // envFilePath: ['.env'], 
    }),
  ],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
