import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import type { PrismaClient as PrismaClientType } from '../../generated/prisma';
const { PrismaClient } = require(process.cwd() + '/generated/prisma');

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);

@Injectable()
export class PrismaService extends (PrismaClient as any) implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await pool.end();
  }
}
