import { Test } from '@nestjs/testing';
import { CurrenciesService } from '../currencies.service';
import { CurrencyRepository } from '../currencies.repository';
import { NotFoundError } from 'src/utils/custom_error';
import { Currency } from '../currency.entity';

describe('CurrenciesService', () => {
  let service: CurrenciesService;
  let repository: jest.Mocked<CurrencyRepository>;

  const mockDatabaseRow = {
    currency_id: 1,
    currency_code: 'USD',
    currency_name: 'US Dollar',
    currency_symbol: '$',
    is_active: true,
    created_at: new Date(),
  };

  const mockCurrency = Currency.fromDatabaseRow(mockDatabaseRow);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CurrenciesService,
        {
          provide: CurrencyRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            searchByName: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<CurrenciesService>(CurrenciesService);
    repository = moduleRef.get(
      CurrencyRepository,
    ) as jest.Mocked<CurrencyRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all currencies', async () => {
      const mockCurrency2 = Currency.fromDatabaseRow({
        ...mockDatabaseRow,
        currency_id: 2,
      });
      const mockCurrencies = [mockCurrency, mockCurrency2];
      repository.findAll.mockResolvedValue(mockCurrencies);

      const result = await service.findAll();
      expect(result).toEqual(mockCurrencies);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no currencies exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a currency when found', async () => {
      repository.findById.mockResolvedValue(mockCurrency);

      const result = await service.findById(1);
      expect(result).toEqual(mockCurrency);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when currency not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('searchByName', () => {
    const mockSearchResult = {
      data: [mockCurrency],
      total: 1,
    };

    it('should return paginated results when currencies found', async () => {
      repository.searchByName.mockResolvedValue(mockSearchResult);

      const result = await service.searchByName('dollar');

      expect(result).toEqual({
        data: mockSearchResult.data,
        page: 1,
        limit: 10,
        total: mockSearchResult.total,
      });
      expect(repository.searchByName).toHaveBeenCalledWith('dollar', 0, 10);
    });

    it('should handle custom pagination parameters', async () => {
      repository.searchByName.mockResolvedValue(mockSearchResult);

      const result = await service.searchByName('euro', 2, 5);

      expect(result).toEqual({
        data: mockSearchResult.data,
        page: 2,
        limit: 5,
        total: mockSearchResult.total,
      });
      expect(repository.searchByName).toHaveBeenCalledWith('euro', 5, 5);
    });

    it('should throw NotFoundError when no currencies match search', async () => {
      repository.searchByName.mockResolvedValue({ data: [], total: 0 });

      await expect(service.searchByName('unknown')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('create', () => {
    const createData = {
      currency_code: 'EUR',
      currency_name: 'Euro',
      currency_symbol: '€',
    };

    it('should create and return a new currency', async () => {
      const createdCurrency = Currency.fromDatabaseRow({
        ...createData,
        currency_id: 2,
        is_active: true,
        created_at: new Date(),
      });
      repository.create.mockResolvedValue(createdCurrency);

      const result = await service.create(createData);

      expect(result).toEqual(createdCurrency);
      expect(repository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('update', () => {
    const updateData = { currency_name: 'New Dollar Name' };

    it('should update and return the currency', async () => {
      repository.findById.mockResolvedValue(mockCurrency);
      const updatedCurrency = Currency.fromDatabaseRow({
        ...mockDatabaseRow,
        ...updateData,
      });
      repository.update.mockResolvedValue(updatedCurrency);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedCurrency);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw NotFoundError when updating non-existent currency', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateData)).rejects.toThrow(
        NotFoundError,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
