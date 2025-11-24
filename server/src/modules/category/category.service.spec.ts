import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CategoryService', () => {
    let service: CategoryService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        category: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    };

    const mockCategory = {
        id: '1',
        name: 'Electronics',
        description: 'Electronic items',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 5 },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoryService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<CategoryService>(CategoryService);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createCategoryDto = {
            name: 'Books',
            description: 'Book items',
        };

        it('should create a new category', async () => {
            mockPrismaService.category.create.mockResolvedValue(mockCategory);

            const result = await service.create(createCategoryDto);

            expect(result).toEqual(mockCategory);
            expect(mockPrismaService.category.create).toHaveBeenCalledWith({
                data: createCategoryDto,
            });
        });
    });

    describe('findAll', () => {
        it('should return paginated categories', async () => {
            const mockCategories = [mockCategory];
            mockPrismaService.category.findMany.mockResolvedValue(mockCategories);
            mockPrismaService.category.count.mockResolvedValue(1);

            const result = await service.findAll(1, 10);

            expect(result.data).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.totalPages).toBe(1);
        });

        it('should handle pagination correctly', async () => {
            mockPrismaService.category.findMany.mockResolvedValue([]);
            mockPrismaService.category.count.mockResolvedValue(25);

            const result = await service.findAll(2, 10);

            expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
                include: expect.any(Object),
                orderBy: { name: 'asc' },
                skip: 10,
                take: 10,
            });
            expect(result.pagination.totalPages).toBe(3);
        });
    });

    describe('findOne', () => {
        it('should return a category by id', async () => {
            const categoryWithProducts = {
                ...mockCategory,
                products: [
                    { id: '1', name: 'Product 1', price: 100, stockQuantity: 10 },
                ],
            };
            mockPrismaService.category.findUnique.mockResolvedValue(
                categoryWithProducts,
            );

            const result = await service.findOne('1');

            expect(result).toBeDefined();
            expect(result.id).toBe('1');
            expect(result.products).toHaveLength(1);
            expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: expect.any(Object),
            });
        });

        it('should throw NotFoundException if category not found', async () => {
            mockPrismaService.category.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
            await expect(service.findOne('999')).rejects.toThrow(
                'Category with ID 999 not found',
            );
        });
    });

    describe('update', () => {
        const updateCategoryDto = {
            name: 'Updated Electronics',
            description: 'Updated description',
        };

        it('should update a category successfully', async () => {
            const updatedCategory = { ...mockCategory, ...updateCategoryDto };
            mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
            mockPrismaService.category.update.mockResolvedValue(updatedCategory);

            const result = await service.update('1', updateCategoryDto);

            expect(result.name).toBe('Updated Electronics');
            expect(mockPrismaService.category.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: updateCategoryDto,
            });
        });

        it('should throw NotFoundException if category not found', async () => {
            mockPrismaService.category.findUnique.mockResolvedValue(null);

            await expect(service.update('999', updateCategoryDto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('remove', () => {
        it('should delete a category successfully', async () => {
            mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
            mockPrismaService.category.delete.mockResolvedValue(mockCategory);

            await service.remove('1');

            expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });

        it('should throw NotFoundException if category not found', async () => {
            mockPrismaService.category.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
        });
    });
});
