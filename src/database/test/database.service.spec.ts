import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database.service';
import { Pool } from 'pg';
import { CustomDatabaseError } from '../../utils/custom_error';

jest.mock('pg');

describe('DatabaseService', () => {
  let service: DatabaseService;

  let mockPoolInstance: any;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockPoolInstance = {
      query: jest.fn(),
      connect: jest.fn(),
    };

    (Pool as jest.MockedClass<typeof Pool>).mockImplementation(
      () => mockPoolInstance,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect successfully', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          DB_USERNAME: 'user',
          DB_HOST: 'localhost',
          DB_DATABASE: 'testdb',
          DB_PASSWORD: 'password',
          DB_PORT: 5432,
        };
        return config[key];
      });

      mockPoolInstance.query.mockResolvedValue({ rows: [{ now: new Date() }] });

      await service.onModuleInit();

      expect(mockPoolInstance.query).toHaveBeenCalledWith('SELECT NOW()');
    });

    it('should throw error when connection fails', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          DB_USERNAME: 'user',
          DB_HOST: 'localhost',
          DB_DATABASE: 'testdb',
          DB_PASSWORD: 'password',
          DB_PORT: 5432,
        };
        return config[key];
      });

      mockPoolInstance.query.mockRejectedValue(new Error('Connection failed'));
      console.error = jest.fn();

      await expect(service.onModuleInit()).rejects.toThrow(CustomDatabaseError);
      expect(console.error).toHaveBeenCalledWith(
        'Database connection error',
        expect.any(Error),
      );
    });
  });

  describe('query', () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    beforeEach(async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          DB_USERNAME: 'user',
          DB_HOST: 'localhost',
          DB_DATABASE: 'testdb',
          DB_PASSWORD: 'password',
          DB_PORT: 5432,
        };
        return config[key];
      });

      mockPoolInstance.query.mockResolvedValue({ rows: [{ now: new Date() }] });
      mockPoolInstance.connect.mockResolvedValue(mockClient);

      await service.onModuleInit();
    });

    it('should execute query successfully', async () => {
      const mockResult = { rows: [{ id: 1 }] };
      mockClient.query.mockResolvedValue(mockResult as any);

      const result = await service.query('SELECT * FROM test', ['param']);

      expect(mockPoolInstance.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM test', [
        'param',
      ]);
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should handle query error and release client', async () => {
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      await expect(service.query('SELECT * FROM test')).rejects.toThrow(
        CustomDatabaseError,
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
