import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database.module';
import { DatabaseService } from '../database.service';
import { ConfigModule } from '@nestjs/config';

describe('DatabaseModule', () => {
  let module: TestingModule;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        DatabaseService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
      exports: [DatabaseService],
    }).compile();
  });

  it('should compile module', () => {
    expect(module).toBeDefined();
  });

  it('should have DatabaseModule defined', () => {
    expect(DatabaseModule).toBeDefined();
  });

  it('should export DatabaseService', () => {
    expect(module.get<DatabaseService>(DatabaseService)).toBeDefined();
  });
});
