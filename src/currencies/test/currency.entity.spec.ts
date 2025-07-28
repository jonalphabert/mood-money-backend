import { Currency } from '../currency.entity';

describe('Currency Entity', () => {
  const validCurrencyData = {
    currency_id: 1,
    currency_name: 'US Dollar',
    currency_code: 'USD',
    currency_symbol: '$',
    currency_symbol_position: 'before',
    currency_decimal_places: 2,
    is_active: true,
  };

  describe('constructor', () => {
    it('should create currency with valid data', () => {
      const currency = new Currency(validCurrencyData);

      expect(currency.currency_id).toBe(1);
      expect(currency.currency_name).toBe('US Dollar');
      expect(currency.currency_code).toBe('USD');
      expect(currency.is_active).toBe(true);
      expect(currency.created_at).toBeInstanceOf(Date);
    });

    it('should set default values', () => {
      const minimalData = {
        currency_name: 'Euro',
        currency_code: 'EUR',
      };

      const currency = new Currency(minimalData);

      expect(currency.is_active).toBe(true);
      expect(currency.created_at).toBeInstanceOf(Date);
    });

    it('should use provided created_at if given', () => {
      const customDate = new Date('2023-01-01');
      const data = {
        ...validCurrencyData,
        created_at: customDate,
      };

      const currency = new Currency(data);

      expect(currency.created_at).toBe(customDate);
    });

    it('should throw error if currency_name is missing', () => {
      const invalidData = {
        currency_code: 'USD',
      };

      expect(() => new Currency(invalidData)).toThrow(
        'Currency name is required',
      );
    });

    it('should throw error if currency_code is missing', () => {
      const invalidData = {
        currency_name: 'US Dollar',
      };

      expect(() => new Currency(invalidData)).toThrow(
        'Currency code is required',
      );
    });

    it('should handle falsy is_active value', () => {
      const data = {
        ...validCurrencyData,
        is_active: false,
      };

      const currency = new Currency(data);

      expect(currency.is_active).toBe(false);
    });
  });

  describe('fromDatabaseRow', () => {
    it('should create currency from database row', () => {
      const dbRow = {
        currency_id: 1,
        currency_name: 'US Dollar',
        currency_code: 'USD',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      };

      const currency = Currency.fromDatabaseRow(dbRow);

      expect(currency.currency_id).toBe(1);
      expect(currency.currency_name).toBe('US Dollar');
      expect(currency.currency_code).toBe('USD');
      expect(currency.is_active).toBe(true);
      expect(currency.created_at).toBeInstanceOf(Date);
      expect(currency.updated_at).toBeInstanceOf(Date);
    });

    it('should handle null dates from database', () => {
      const dbRow = {
        currency_id: 1,
        currency_name: 'US Dollar',
        currency_code: 'USD',
        is_active: true,
        created_at: null,
        updated_at: null,
      };

      const currency = Currency.fromDatabaseRow(dbRow);

      expect(currency.created_at).toBeInstanceOf(Date);
      expect(currency.updated_at).toBeUndefined();
    });

    it('should handle missing optional fields', () => {
      const dbRow = {
        currency_id: 1,
        currency_name: 'US Dollar',
        currency_code: 'USD',
        is_active: true,
      };

      const currency = Currency.fromDatabaseRow(dbRow);

      expect(currency.currency_id).toBe(1);
      expect(currency.is_active).toBe(true);
      expect(currency.created_at).toBeInstanceOf(Date);
    });
  });

  describe('toDatabaseModel', () => {
    it('should convert currency to database model', () => {
      const currency = new Currency(validCurrencyData);
      const dbModel = currency.toDatabaseModel();

      expect(dbModel).toEqual({
        currency_id: currency.currency_id,
        currency_name: currency.currency_name,
        currency_code: currency.currency_code,
        is_active: currency.is_active,
        created_at: currency.created_at,
        updated_at: currency.updated_at,
      });
    });

    it('should include undefined fields', () => {
      const currency = new Currency({
        currency_name: 'Euro',
        currency_code: 'EUR',
      });
      const dbModel = currency.toDatabaseModel();

      expect(dbModel.updated_at).toBeUndefined();
      expect(dbModel.currency_id).toBeUndefined();
    });
  });

  describe('activate', () => {
    it('should set is_active to true', () => {
      const currency = new Currency({
        ...validCurrencyData,
        is_active: false,
      });

      currency.activate();

      expect(currency.is_active).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should set is_active to false', () => {
      const currency = new Currency(validCurrencyData);

      currency.deactivate();

      expect(currency.is_active).toBe(false);
    });
  });

  describe('validate', () => {
    it('should pass validation for valid currency', () => {
      const currency = new Currency(validCurrencyData);

      expect(() => currency.validate()).not.toThrow();
    });

    it('should throw error for invalid currency code length', () => {
      const currency = new Currency({
        ...validCurrencyData,
        currency_code: 'US',
      });

      expect(() => currency.validate()).toThrow(
        'Currency code must be 3 characters',
      );
    });

    it('should throw error for long currency code', () => {
      const currency = new Currency({
        ...validCurrencyData,
        currency_code: 'USDD',
      });

      expect(() => currency.validate()).toThrow(
        'Currency code must be 3 characters',
      );
    });

    it('should throw error for invalid symbol position', () => {
      const currency = new Currency({
        ...validCurrencyData,
        currency_symbol_position: 'middle',
      });

      expect(() => currency.validate()).toThrow(
        'Currency symbol position must be "before" or "after"',
      );
    });

    it('should pass validation for "after" symbol position', () => {
      const currency = new Currency({
        ...validCurrencyData,
        currency_symbol_position: 'after',
      });

      expect(() => currency.validate()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string currency code in validation', () => {
      expect(
        () =>
          new Currency({
            ...validCurrencyData,
            currency_code: '',
          }),
      ).toThrow('Currency code is required');
    });

    it('should handle undefined symbol position in validation', () => {
      const currency = new Currency({
        ...validCurrencyData,
        currency_symbol_position: undefined,
      });

      expect(() => currency.validate()).toThrow(
        'Currency symbol position must be "before" or "after"',
      );
    });

    it('should preserve all properties when created', () => {
      const fullData = {
        currency_id: 1,
        currency_name: 'US Dollar',
        currency_code: 'USD',
        currency_symbol: '$',
        currency_symbol_position: 'before',
        currency_decimal_places: 2,
        is_active: true,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-02'),
      };

      const currency = new Currency(fullData);

      expect(currency.currency_symbol).toBe('$');
      expect(currency.currency_symbol_position).toBe('before');
      expect(currency.currency_decimal_places).toBe(2);
      expect(currency.updated_at).toEqual(fullData.updated_at);
    });
  });
});
