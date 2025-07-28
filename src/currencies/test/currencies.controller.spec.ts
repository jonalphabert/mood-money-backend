import { Test, TestingModule } from '@nestjs/testing';
import { CurrenciesController } from '../currencies.controller';
import { CurrenciesService } from '../currencies.service';

describe('CurrenciesController', () => {
  let controller: CurrenciesController;
  let service: CurrenciesService;

  const mockCurrenciesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

      const expectedResult = {
        id: 1,
        ...createCurrencyDto,
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(createCurrencyDto)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createCurrencyDto);
    });
  });

  describe('findAll', () => {
    it('should return array of currencies', async () => {
      const expectedResult = [
        {
          currency_id: 1,
          currency_name: 'US Dollar',
          currency_code: 'USD',
          currency_symbol: '$',
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      expect(await controller.findAll()).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single currency', async () => {
      const expectedResult = {
        id: 1,
        name: 'US Dollar',
        code: 'USD',
        symbol: '$',
      };

      jest.spyOn(service, 'findById').mockResolvedValue(expectedResult);

      expect(await controller.findOne('1')).toBe(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a currency', async () => {
      const updateCurrencyDto = {
        currency_name: 'Euro',
        currency_code: 'EUR',
        currency_symbol: '€',
      };

      const expectedResult = {
        id: 1,
        ...updateCurrencyDto,
      };

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      expect(await controller.update('1', updateCurrencyDto)).toBe(
        expectedResult,
      );
      expect(service.update).toHaveBeenCalledWith(1, updateCurrencyDto);
    });
  });

  describe('remove', () => {
    it('should delete a currency', async () => {
      const updateCurrencyDto = {
        is_active: false,
      };

      const expectedResult = {
        id: 1,
        name: 'US Dollar',
        code: 'USD',
        symbol: '$',
        is_active: false,
      };

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      expect(await controller.update('1', updateCurrencyDto)).toBe(
        expectedResult,
      );
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

      jest.spyOn(service, 'searchByName').mockResolvedValue(expectedResult);

      expect(
        await controller.searchByName({ name: 'USD', page: 1, limit: 10 }),
      ).toBe(expectedResult);

      expect(service.searchByName).toHaveBeenCalledWith('USD', 1, 10);
    });

    it('should return array of currencies when found', async () => {
      const expectedResult = {
        data: [
          {
            currency_id: 1,
            currency_name: 'US Dollar',
            currency_code: 'USD',
            currency_symbol: '$',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      };

      jest.spyOn(service, 'searchByName').mockResolvedValue(expectedResult);

      expect(
        await controller.searchByName({ name: 'USD', page: 1, limit: 10 }),
      ).toBe(expectedResult);

      expect(service.searchByName).toHaveBeenCalledWith('USD', 1, 10);
    });
  });
});
