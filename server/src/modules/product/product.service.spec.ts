import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductService', () => {
    let service: ProductService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        product: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        category: {
            findUnique: jest.fn(),
        },
        orderItem: {
            count: jest.fn(),
        },
    };

    const mockProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        stockQuantity: 10,
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
            id: 'cat-1',
            name: 'Electronics',
            description: 'Electronic items',
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createProductDto = {
            name: 'New Product',
            description: 'New description',
            price: 149.99,
            stockQuantity: 20,
            categoryId: 'cat-1',
        };

        it('should create a new product successfully', async () => {
            mockPrismaService.category.findUnique.mockResolvedValue({
                id: 'cat-1',
                name: 'Electronics',
            });
            mockPrismaService.product.create.mockResolvedValue(mockProduct);

            const result = await service.create(createProductDto);

            expect(result).toBeDefined();
            expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
                where: { id: createProductDto.categoryId },
            });
            expect(mockPrismaService.product.create).toHaveBeenCalledWith({
                data: createProductDto,
                include: { category: true },
            });
        });

        it('should throw NotFoundException if category not found', async () => {
            mockPrismaService.category.findUnique.mockResolvedValue(null);

            await expect(service.create(createProductDto)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.create(createProductDto)).rejects.toThrow(
                `Category with ID ${createProductDto.categoryId} not found`,
            );
        });
    });

    describe('findAll', () => {
        it('should return paginated products', async () => {
            const mockProducts = [mockProduct];
            mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
            mockPrismaService.product.count.mockResolvedValue(1);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });

        it('should filter by category', async () => {
            mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
            mockPrismaService.product.count.mockResolvedValue(1);

            await service.findAll({ categoryId: 'cat-1', page: 1, limit: 10 });

            expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ categoryId: 'cat-1' }),
                }),
            );
        });

        it('should filter by price range', async () => {
            mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
            mockPrismaService.product.count.mockResolvedValue(1);

            await service.findAll({ minPrice: 50, maxPrice: 150, page: 1, limit: 10 });

            expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        price: { gte: 50, lte: 150 },
                    }),
                }),
            );
        });

        it('should filter by search term', async () => {
            mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
            mockPrismaService.product.count.mockResolvedValue(1);

            await service.findAll({ search: 'Test', page: 1, limit: 10 });

            expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            { name: { contains: 'Test', mode: 'insensitive' } },
                            { description: { contains: 'Test', mode: 'insensitive' } },
                        ]),
                    }),
                }),
            );
        });
    });

    describe('findOne', () => {
        it('should return a product by id', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

            const result = await service.findOne('1');

            expect(result).toBeDefined();
            expect(result.id).toBe('1');
            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: { category: true },
            });
        });

        it('should throw NotFoundException if product not found', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
            await expect(service.findOne('999')).rejects.toThrow(
                'Product with ID 999 not found',
            );
        });
    });

    describe('update', () => {
        const updateProductDto = {
            name: 'Updated Product',
            price: 199.99,
        };

        it('should update a product successfully', async () => {
            const updatedProduct = { ...mockProduct, ...updateProductDto };
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.product.update.mockResolvedValue(updatedProduct);

            const result = await service.update('1', updateProductDto);

            expect(result.name).toBe('Updated Product');
            expect(mockPrismaService.product.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: updateProductDto,
                include: { category: true },
            });
        });

        it('should throw NotFoundException if product not found', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(service.update('999', updateProductDto)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should verify category exists when updating categoryId', async () => {
            const updateWithCategory = { categoryId: 'cat-2' };
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.category.findUnique.mockResolvedValue({
                id: 'cat-2',
                name: 'Books',
            });
            mockPrismaService.product.update.mockResolvedValue(mockProduct);

            await service.update('1', updateWithCategory);

            expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
                where: { id: 'cat-2' },
            });
        });
    });

    describe('remove', () => {
        it('should delete a product successfully', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
            mockPrismaService.orderItem.count.mockResolvedValue(0);
            mockPrismaService.product.delete.mockResolvedValue(mockProduct);

            await service.remove('1');

            expect(mockPrismaService.orderItem.count).toHaveBeenCalledWith({
                where: { productId: '1' },
            });
            expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });

        it('should throw NotFoundException if product not found', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
        });
    });
});
