import { Test, TestingModule } from '@nestjs/testing';
import { CurrenciesController } from '../currencies.controller';
import { CurrenciesService } from '../currencies.service';
import { Currency } from '../currency.entity';

describe('CurrenciesController', () => {
  let controller: CurrenciesController;
  let service: CurrenciesService;

  const mockDatabaseRow = {
    currency_id: 1,
    currency_code: 'USD',
    currency_name: 'US Dollar',
    currency_symbol: '$',
    is_active: true,
    created_at: new Date(),
  };

  const mockCurrency = Currency.fromDatabaseRow(mockDatabaseRow);

  const mockCurrenciesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    searchByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrenciesController],
      providers: [
        {
          provide: CurrenciesService,
          useValue: mockCurrenciesService,
        },
      ],
    }).compile();

    controller = module.get<CurrenciesController>(CurrenciesController);
    service = module.get<CurrenciesService>(CurrenciesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a currency', async () => {
      const createCurrencyDto = {
        currency_name: 'US Dollar',
        currency_code: 'USD',
        currency_symbol: '$',
      };

      mockCurrenciesService.create.mockResolvedValue(mockCurrency);

      const result = await controller.create(createCurrencyDto);

      expect(result).toBe(mockCurrency);
      expect(mockCurrenciesService.create).toHaveBeenCalledWith(
        createCurrencyDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return array of currencies', async () => {
      const expectedResult = [mockCurrency];

      mockCurrenciesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toBe(expectedResult);
      expect(mockCurrenciesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single currency', async () => {
      mockCurrenciesService.findById.mockResolvedValue(mockCurrency);

      const result = await controller.findOne('1');

      expect(result).toBe(mockCurrency);
      expect(mockCurrenciesService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a currency', async () => {
      const updateCurrencyDto = {
        currency_name: 'Euro',
        currency_code: 'EUR',
        currency_symbol: '€',
      };

      const updatedCurrency = Currency.fromDatabaseRow({
        ...mockDatabaseRow,
        ...updateCurrencyDto,
      });

      mockCurrenciesService.update.mockResolvedValue(updatedCurrency);

      const result = await controller.update('1', updateCurrencyDto);

      expect(result).toBe(updatedCurrency);
      expect(mockCurrenciesService.update).toHaveBeenCalledWith(
        1,
        updateCurrencyDto,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete a currency', async () => {
      const deactivatedCurrency = Currency.fromDatabaseRow({
        ...mockDatabaseRow,
        is_active: false,
      });

      mockCurrenciesService.update.mockResolvedValue(deactivatedCurrency);

      const result = await controller.delete('1');

      expect(result).toBe(deactivatedCurrency);
      expect(mockCurrenciesService.update).toHaveBeenCalledWith(1, {
        is_active: false,
      });
    });
  });

  describe('searchByName', () => {
    it('should return empty array when no currencies found', async () => {
      const expectedResult = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
      };

      mockCurrenciesService.searchByName.mockResolvedValue(expectedResult);

      const result = await controller.searchByName({
        name: 'USD',
        page: 1,
        limit: 10,
      });

      expect(result).toBe(expectedResult);
      expect(mockCurrenciesService.searchByName).toHaveBeenCalledWith(
        'USD',
        1,
        10,
      );
    });

    it('should return array of currencies when found', async () => {
      const expectedResult = {
        data: [mockCurrency],
        page: 1,
        limit: 10,
        total: 1,
      };

      mockCurrenciesService.searchByName.mockResolvedValue(expectedResult);

      const result = await controller.searchByName({
        name: 'USD',
        page: 1,
        limit: 10,
      });

      expect(result).toBe(expectedResult);
      expect(mockCurrenciesService.searchByName).toHaveBeenCalledWith(
        'USD',
        1,
        10,
      );
    });
  });
});
