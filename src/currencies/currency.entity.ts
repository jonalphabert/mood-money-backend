export class Currency {
  currency_id: number;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  currency_symbol_position: string;
  currency_decimal_places: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;

  constructor(data: Partial<Currency>) {
    if (!data.currency_name) throw new Error('Currency name is required');
    if (!data.currency_code) throw new Error('Currency code is required');

    Object.assign(this, data);

    this.is_active = data.is_active ?? true;
    this.created_at = data.created_at || new Date();
  }

  static fromDatabaseRow(row: any): Currency {
    return new Currency({
      currency_id: row.currency_id,
      currency_name: row.currency_name,
      currency_code: row.currency_code,
      is_active: row.is_active,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
    });
  }

  toDatabaseModel() {
    return {
      currency_id: this.currency_id,
      currency_name: this.currency_name,
      currency_code: this.currency_code,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  activate() {
    this.is_active = true;
  }

  deactivate() {
    this.is_active = false;
  }

  validate() {
    if (this.currency_code.length !== 3) {
      throw new Error('Currency code must be 3 characters');
    }

    if (
      this.currency_symbol_position !== 'before' &&
      this.currency_symbol_position !== 'after'
    ) {
      throw new Error('Currency symbol position must be "before" or "after"');
    }
  }
}
