export class Category {
  category_id: string;
  user_id: string;
  category_name: string;
  category_type: string;
  parent_id: string;
  is_active: boolean;

  constructor(data: Partial<Category>) {
    Object.assign(this, data);
  }

  static fromDatabaseRow(row: any): Category {
    return new Category({
      category_id: row.category_id,
      user_id: row.user_id,
      category_name: row.category_name,
      category_type: row.category_type,
      parent_id: row.parent_id,
      is_active: row.is_active,
    });
  }

  toDatabaseModel() {
    return {
      category_id: this.category_id,
      user_id: this.user_id,
      category_name: this.category_name,
      category_type: this.category_type,
      parent_id: this.parent_id,
      is_active: this.is_active,
    };
  }

  validate() {
    if (!this.category_name) throw new Error('Category name is required');
    if (!this.category_type) throw new Error('Category type is required');
    if (!this.user_id) throw new Error('User id is required');

    if (this.category_type !== 'expense' && this.category_type !== 'income')
      throw new Error('Category type must be "expense" or "income"');
  }
}
