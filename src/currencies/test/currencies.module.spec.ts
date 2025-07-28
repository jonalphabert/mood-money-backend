import { Test, TestingModule } from '@nestjs/testing';
import { CurrenciesModule } from '../currencies.module';
import { CurrenciesController } from '../currencies.controller';
import { CurrenciesService } from '../currencies.service';
import { CurrencyRepository } from '../currencies.repository';
import { DatabaseService } from '../../database/database.service';

describe('CurrenciesModule', () => {
  let module: TestingModule;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [CurrenciesController],
      providers: [
        CurrenciesService,
        CurrencyRepository,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();
  });

  it('should compile module', () => {
    expect(module).toBeDefined();
  });

  it('should have CurrenciesModule defined', () => {
    expect(CurrenciesModule).toBeDefined();
  });

  it('should have CurrenciesController', () => {
    const controller = module.get<CurrenciesController>(CurrenciesController);
    expect(controller).toBeDefined();
  });

  it('should have CurrenciesService', () => {
    const service = module.get<CurrenciesService>(CurrenciesService);
    expect(service).toBeDefined();
  });

  it('should have CurrencyRepository', () => {
    const repository = module.get<CurrencyRepository>(CurrencyRepository);
    expect(repository).toBeDefined();
  });
});
