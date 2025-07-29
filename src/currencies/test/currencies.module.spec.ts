import { Test, TestingModule } from '@nestjs/testing';
import { CurrenciesModule } from '../currencies.module';
import { CurrenciesController } from '../currencies.controller';
import { CurrenciesService } from '../currencies.service';
import { CurrencyRepository } from '../currencies.repository';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('CurrenciesModule', () => {
  let module: TestingModule;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [CurrenciesController],
      providers: [
        CurrenciesService,
        CurrencyRepository,
        JwtAuthGuard,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();
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
