import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesModule } from '../categories.module';
import { CategoriesController } from '../categories.controller';
import { CategoriesService } from '../categories.service';
import { CategoriesRepository } from '../categories.repository';
import { DatabaseService } from '../../database/database.service';

describe('CategoriesModule', () => {
  let module: TestingModule;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        CategoriesRepository,
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

  it('should have CategoriesModule defined', () => {
    expect(CategoriesModule).toBeDefined();
  });

  it('should have CategoriesController', () => {
    const controller = module.get<CategoriesController>(CategoriesController);
    expect(controller).toBeDefined();
  });

  it('should have CategoriesService', () => {
    const service = module.get<CategoriesService>(CategoriesService);
    expect(service).toBeDefined();
  });

  it('should have CategoriesRepository', () => {
    const repository = module.get<CategoriesRepository>(CategoriesRepository);
    expect(repository).toBeDefined();
  });
});
