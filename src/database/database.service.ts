import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    const config: PoolConfig = {
      user: this.configService.get<string>('DB_USERNAME'),
      host: this.configService.get<string>('DB_HOST'),
      database: this.configService.get<string>('DB_DATABASE'),
      password: this.configService.get<string>('DB_PASSWORD'),
      port: this.configService.get<number>('DB_PORT'),
      max: 20, // max connections
    };

    this.pool = new Pool(config);

    // Test connection
    try {
      await this.pool.query('SELECT NOW()');
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection error', error);
      throw error;
    }
  }

  async query(sql: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  }
}
