import { OrderStatus } from '@prisma/client';

export class OrderItemEntity {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;

  constructor(partial: Partial<OrderItemEntity>) {
    Object.assign(this, partial);
  }
}

export class OrderEntity {
  id: string;
  userId: string;
  status: OrderStatus;
  totalPrice: number;
  orderItems?: OrderItemEntity[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);
  }
}
