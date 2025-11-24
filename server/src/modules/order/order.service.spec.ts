import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

describe('OrderService', () => {
    let service: OrderService;
    let prismaService: PrismaService;

    const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        price: 99.99,
        stockQuantity: 10,
        categoryId: 'cat-1',
    };

    const mockCart = {
        id: 'cart-1',
        userId: 'user-1',
        items: [
            {
                id: 'item-1',
                cartId: 'cart-1',
                productId: 'prod-1',
                quantity: 2,
                product: mockProduct,
            },
        ],
    };

    const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        totalPrice: 199.98,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [
            {
                id: 'order-item-1',
                orderId: 'order-1',
                productId: 'prod-1',
                quantity: 2,
                price: 99.99,
                product: {
                    ...mockProduct,
                    category: { id: 'cat-1', name: 'Electronics' },
                },
            },
        ],
        user: {
            id: 'user-1',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
        },
    };

    const mockPrismaService = {
        cart: {
            findUnique: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
        },
        order: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        cartItem: {
            deleteMany: jest.fn(),
        },
        $transaction: jest.fn(),
        $queryRaw: jest.fn(),
        $executeRaw: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createFromCart', () => {
        it('should create order from cart successfully', async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    $queryRaw: jest.fn().mockResolvedValue([{ stockQuantity: 10 }]),
                    $executeRaw: jest.fn().mockResolvedValue(1),
                    order: {
                        create: jest.fn().mockResolvedValue(mockOrder),
                    },
                    cartItem: {
                        deleteMany: jest.fn(),
                    },
                };
                return callback(tx);
            });

            const result = await service.createFromCart('user-1');

            expect(result).toBeDefined();
            expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                include: expect.any(Object),
            });
        });

        it('should throw BadRequestException if cart is empty', async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue({
                id: 'cart-1',
                userId: 'user-1',
                items: [],
            });

            await expect(service.createFromCart('user-1')).rejects.toThrow(
                BadRequestException,
            );
            await expect(service.createFromCart('user-1')).rejects.toThrow(
                'Cart is empty',
            );
        });

        it('should throw BadRequestException if cart not found', async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(null);

            await expect(service.createFromCart('user-1')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException if insufficient stock', async () => {
            const cartWithHighQuantity = {
                ...mockCart,
                items: [
                    {
                        ...mockCart.items[0],
                        quantity: 20,
                    },
                ],
            };
            mockPrismaService.cart.findUnique.mockResolvedValue(cartWithHighQuantity);

            await expect(service.createFromCart('user-1')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should use row-level locking for concurrent orders', async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
            mockPrismaService.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    $queryRaw: jest.fn().mockResolvedValue([{ stockQuantity: 10 }]),
                    $executeRaw: jest.fn().mockResolvedValue(1),
                    order: {
                        create: jest.fn().mockResolvedValue(mockOrder),
                    },
                    cartItem: {
                        deleteMany: jest.fn(),
                    },
                };
                return callback(tx);
            });

            await service.createFromCart('user-1');

            expect(mockPrismaService.$transaction).toHaveBeenCalled();
        });
    });

    describe('createDirect', () => {
        const createOrderDto = {
            items: [
                { productId: 'prod-1', quantity: 2 },
            ],
        };

        it('should create order directly', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    $queryRaw: jest.fn().mockResolvedValue([mockProduct]),
                    $executeRaw: jest.fn().mockResolvedValue(1),
                    order: {
                        create: jest.fn().mockResolvedValue(mockOrder),
                    },
                    product: {
                        findUnique: jest.fn().mockResolvedValue(mockProduct),
                    },
                };
                return callback(tx);
            });

            const result = await service.createDirect('user-1', createOrderDto);

            expect(result).toBeDefined();
        });

        it('should throw BadRequestException if product not found', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(
                service.createDirect('user-1', createOrderDto),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if insufficient stock', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue({
                ...mockProduct,
                stockQuantity: 1,
            });

            await expect(
                service.createDirect('user-1', createOrderDto),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        it('should return paginated orders', async () => {
            const mockOrders = [mockOrder];
            mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
            mockPrismaService.order.count.mockResolvedValue(1);

            const result = await service.findAll(1, 10);

            expect(result.data).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });

        it('should handle pagination correctly', async () => {
            mockPrismaService.order.findMany.mockResolvedValue([]);
            mockPrismaService.order.count.mockResolvedValue(25);

            const result = await service.findAll(2, 10);

            expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
                include: expect.any(Object),
                skip: 10,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });
            expect(result.pagination.totalPages).toBe(3);
        });
    });

    describe('findByUser', () => {
        it('should return user orders', async () => {
            const mockOrders = [mockOrder];
            mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
            mockPrismaService.order.count.mockResolvedValue(1);

            const result = await service.findByUser('user-1', 1, 10);

            expect(result.data).toHaveLength(1);
            expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                include: expect.any(Object),
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('findOne', () => {
        it('should return an order by id', async () => {
            mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

            const result = await service.findOne('order-1');

            expect(result).toBeDefined();
            expect(result.id).toBe('order-1');
            expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
                where: { id: 'order-1' },
                include: expect.any(Object),
            });
        });

        it('should throw NotFoundException if order not found', async () => {
            mockPrismaService.order.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
            await expect(service.findOne('999')).rejects.toThrow(
                'Order with ID 999 not found',
            );
        });
    });

    describe('update', () => {
        const updateOrderDto = {
            status: OrderStatus.DELIVERED,
        };

        it('should update order status', async () => {
            const updatedOrder = { ...mockOrder, status: OrderStatus.DELIVERED };
            mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
            mockPrismaService.order.update.mockResolvedValue(updatedOrder);

            const result = await service.update('order-1', updateOrderDto);

            expect(result.status).toBe(OrderStatus.DELIVERED);
            expect(mockPrismaService.order.update).toHaveBeenCalledWith({
                where: { id: 'order-1' },
                data: updateOrderDto,
                include: expect.any(Object),
            });
        });

        it('should throw NotFoundException if order not found', async () => {
            mockPrismaService.order.findUnique.mockResolvedValue(null);

            await expect(service.update('999', updateOrderDto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('cancel', () => {
        it('should cancel a pending order', async () => {
            const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
            mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
            mockPrismaService.$transaction.mockImplementation(async (callback) => {
                const tx = {
                    order: {
                        findUnique: jest.fn().mockResolvedValue({
                            ...mockOrder,
                            orderItems: [
                                {
                                    id: 'item-1',
                                    orderId: 'order-1',
                                    productId: 'product-1',
                                    quantity: 2,
                                    price: 99.99,
                                },
                            ],
                        }),
                        update: jest.fn().mockResolvedValue(cancelledOrder),
                    },
                    product: {
                        update: jest.fn(),
                    },
                };
                return callback(tx);
            });

            const result = await service.cancel('order-1');

            expect(result.status).toBe(OrderStatus.CANCELLED);
        });

        it('should throw BadRequestException if order already delivered', async () => {
            const deliveredOrder = { ...mockOrder, status: OrderStatus.DELIVERED };
            mockPrismaService.order.findUnique.mockResolvedValue(deliveredOrder);

            await expect(service.cancel('order-1')).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('remove', () => {
        it('should delete an order successfully', async () => {
            mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
            mockPrismaService.order.delete.mockResolvedValue(mockOrder);

            await service.remove('order-1');

            expect(mockPrismaService.order.delete).toHaveBeenCalledWith({
                where: { id: 'order-1' },
            });
        });

        it('should throw NotFoundException if order not found', async () => {
            mockPrismaService.order.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
        });
    });
});
