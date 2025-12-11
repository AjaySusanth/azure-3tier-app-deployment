import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; 
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; 
import { ConfigService } from '@nestjs/config'; 

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

  constructor(private configService: ConfigService) {

    const connectionString = configService.get<string>('DATABASE_URL');
    
    if (!connectionString) {
        throw new Error("FATAL: DATABASE_URL is undefined after ConfigModule load.");
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    // 2. Call super() with the required parameters (adapter).
    super({ adapter });

    // 3. Now that super() is called, the private property `this.configService` is initialized.
    //    No further code is needed here, as we only need configService for the initialization above.
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}