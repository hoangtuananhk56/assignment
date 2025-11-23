import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) { }

  async createFromCart(userId: string): Promise<OrderEntity> {
    // Get user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock and calculate total
    let totalPrice = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: number;
    }> = [];

    for (const item of cart.items) {
      const product = item.product;

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}`,
        );
      }

      const itemPrice = product.price * item.quantity;
      totalPrice += itemPrice;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create order, deduct stock, and clear cart in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalPrice,
          status: OrderStatus.PENDING,
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
      });

      // Update product stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return new OrderEntity(order);
  }

  async findAll(): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => new OrderEntity(order));
  }

  async findByUser(userId: string): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => new OrderEntity(order));
  }

  async findOne(id: string): Promise<OrderEntity> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return new OrderEntity(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderEntity> {
    await this.findOne(id);

    const order = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        user: true,
      },
    });

    return new OrderEntity(order);
  }

  async cancel(id: string): Promise<OrderEntity> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot cancel order with current status');
    }

    // Restore product stock
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const orderWithItems = await tx.order.findUnique({
        where: { id },
        include: { orderItems: true },
      });

      for (const item of orderWithItems!.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
      });
    });

    return new OrderEntity(updatedOrder);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.order.delete({
      where: { id },
    });
  }
}
