import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CartService', () => {
    let service: CartService;
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
        createdAt: new Date(),
        updatedAt: new Date(),
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

    const mockPrismaService = {
        cart: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        cartItem: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<CartService>(CartService);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getOrCreateCart', () => {
        it('should return existing cart', async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

            const result = await service.getOrCreateCart('user-1');

            expect(result).toBeDefined();
            expect(result.id).toBe('cart-1');
            expect(mockPrismaService.cart.findUnique).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                include: expect.any(Object),
            });
        });

        it('should create new cart if not exists', async () => {
            const emptyCart = { ...mockCart, items: [] };
            mockPrismaService.cart.findUnique.mockResolvedValue(null);
            mockPrismaService.cart.create.mockResolvedValue(emptyCart);

            const result = await service.getOrCreateCart('user-1');

            expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
                data: { userId: 'user-1' },
                include: expect.any(Object),
            });
            expect(result.items).toHaveLength(0);
        });

        it('should calculate cart totals', async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

            const result = await service.getOrCreateCart('user-1');

            expect(result).toHaveProperty('itemCount');
            expect(result).toHaveProperty('totalPrice');
            expect(result.itemCount).toBe(1);
            expect(result.totalPrice).toBe(199.98);
        });
    });

    describe('addItem', () => {
        const addToCartDto = {
            productId: 'prod-1',
            quantity: 1,
        };

        it('should add new item to cart', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
            mockPrismaService.cartItem.findUnique.mockResolvedValue(null);
            mockPrismaService.cartItem.create.mockResolvedValue({});
            mockPrismaService.cart.findUnique.mockResolvedValueOnce({ id: 'cart-1' }).mockResolvedValueOnce(mockCart);

            await service.addItem('user-1', addToCartDto);

            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: 'prod-1' },
            });
            expect(mockPrismaService.cartItem.create).toHaveBeenCalledWith({
                data: {
                    cartId: 'cart-1',
                    productId: 'prod-1',
                    quantity: 1,
                },
            });
        });

        it('should update quantity if item already in cart', async () => {
            const existingItem = {
                id: 'item-1',
                cartId: 'cart-1',
                productId: 'prod-1',
                quantity: 2,
            };
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
            mockPrismaService.cartItem.findUnique.mockResolvedValue(existingItem);
            mockPrismaService.cartItem.update.mockResolvedValue({});
            mockPrismaService.cart.findUnique.mockResolvedValueOnce({ id: 'cart-1' }).mockResolvedValueOnce(mockCart);

            await service.addItem('user-1', addToCartDto);

            expect(mockPrismaService.cartItem.update).toHaveBeenCalledWith({
                where: { id: 'item-1' },
                data: { quantity: 3 },
            });
        });

        it('should throw NotFoundException if product not found', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(service.addItem('user-1', addToCartDto)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw BadRequestException if insufficient stock', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue({
                ...mockProduct,
                stockQuantity: 0,
            });

            await expect(service.addItem('user-1', addToCartDto)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should create cart if not exists', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.cart.findUnique.mockResolvedValueOnce(null);
            mockPrismaService.cart.create.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
            mockPrismaService.cartItem.findUnique.mockResolvedValue(null);
            mockPrismaService.cartItem.create.mockResolvedValue({});
            mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);

            await service.addItem('user-1', addToCartDto);

            expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
                data: { userId: 'user-1' },
            });
        });
    });

    describe('updateItem', () => {
        const updateDto = { quantity: 5 };

        it('should update item quantity', async () => {
            const cartItem = {
                id: 'item-1',
                cartId: 'cart-1',
                productId: 'prod-1',
                quantity: 2,
                cart: { userId: 'user-1' },
                product: mockProduct,
            };
            mockPrismaService.cart.findUnique.mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1' })
                .mockResolvedValueOnce(mockCart);
            mockPrismaService.cartItem.findUnique.mockResolvedValue(cartItem);
            mockPrismaService.cartItem.update.mockResolvedValue({});

            await service.updateItem('user-1', 'prod-1', updateDto);

            expect(mockPrismaService.cartItem.update).toHaveBeenCalledWith({
                where: { id: 'item-1' },
                data: { quantity: 5 },
            });
        });

        it('should throw NotFoundException if cart not found', async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue(null);

            await expect(
                service.updateItem('user-1', 'prod-1', updateDto),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if item not in cart', async () => {
            mockPrismaService.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
            mockPrismaService.cartItem.findUnique.mockResolvedValue(null);

            await expect(
                service.updateItem('user-1', 'prod-1', updateDto),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if insufficient stock', async () => {
            const cartItem = {
                id: 'item-1',
                cartId: 'cart-1',
                productId: 'prod-1',
                quantity: 2,
                cart: { userId: 'user-1' },
                product: { ...mockProduct, stockQuantity: 2 },
            };
            mockPrismaService.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
            mockPrismaService.cartItem.findUnique.mockResolvedValue(cartItem);

            await expect(
                service.updateItem('user-1', 'prod-1', updateDto),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('removeItem', () => {
        it('should remove item from cart', async () => {
            const cartItem = {
                id: 'item-1',
                cartId: 'cart-1',
                productId: 'prod-1',
                quantity: 2,
                cart: { userId: 'user-1' },
            };
            mockPrismaService.cartItem.findUnique.mockResolvedValue(cartItem);
            mockPrismaService.cartItem.delete.mockResolvedValue({});
            mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

            await service.removeItem('user-1', 'prod-1');

            expect(mockPrismaService.cartItem.delete).toHaveBeenCalledWith({
                where: expect.any(Object),
            });
        });

        it('should throw NotFoundException if item not found', async () => {
            mockPrismaService.cartItem.findUnique.mockResolvedValue(null);

            await expect(service.removeItem('user-1', 'prod-1')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('clearCart', () => {
        it('should clear all items from cart', async () => {
            mockPrismaService.cart.findUnique
                .mockResolvedValueOnce(mockCart)
                .mockResolvedValueOnce({ ...mockCart, items: [] });
            mockPrismaService.cartItem.deleteMany.mockResolvedValue({ count: 1 });

            await service.clearCart('user-1');

            expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalledWith({
                where: { cartId: 'cart-1' },
            });
        });

        it('should return cart when cart not found', async () => {
            const emptyCart = { ...mockCart, items: [] };
            mockPrismaService.cart.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null);
            mockPrismaService.cart.create.mockResolvedValue(emptyCart);

            const result = await service.clearCart('user-1');

            expect(result).toBeDefined();
        });
    });
});
