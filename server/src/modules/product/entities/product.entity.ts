export class ProductEntity {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}
