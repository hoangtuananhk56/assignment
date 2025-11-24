import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
    let service: UserService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        role: {
            findUnique: jest.fn(),
        },
    };

    const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        roleName: 'customer',
        roleId: 'role-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        role: {
            id: 'role-1',
            name: 'customer',
            description: 'Customer role',
            permissions: [],
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createUserDto = {
            email: 'newuser@example.com',
            password: 'password123',
            firstName: 'Jane',
            lastName: 'Smith',
            roleName: 'customer',
        };

        it('should create a new user successfully', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.role.findUnique.mockResolvedValue({
                id: 'role-1',
                name: 'customer',
            });
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            mockPrismaService.user.create.mockResolvedValue(mockUser);

            const result = await service.create(createUserDto);

            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: createUserDto.email },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
            expect(mockPrismaService.user.create).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.email).toBe(mockUser.email);
        });

        it('should throw ConflictException if user already exists', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            await expect(service.create(createUserDto)).rejects.toThrow(
                ConflictException,
            );
            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: createUserDto.email },
            });
        });

        it('should throw NotFoundException if role not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.role.findUnique.mockResolvedValue(null);

            await expect(service.create(createUserDto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findAll', () => {
        it('should return paginated users', async () => {
            const mockUsers = [mockUser];
            mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
            mockPrismaService.user.count.mockResolvedValue(1);

            const result = await service.findAll(1, 10);

            expect(result.data).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.totalPages).toBe(1);
        });

        it('should handle pagination correctly', async () => {
            mockPrismaService.user.findMany.mockResolvedValue([]);
            mockPrismaService.user.count.mockResolvedValue(25);

            const result = await service.findAll(2, 10);

            expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
                include: expect.any(Object),
                skip: 10,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });
            expect(result.pagination.totalPages).toBe(3);
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findOne('1');

            expect(result).toBeDefined();
            expect(result.id).toBe('1');
            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: expect.any(Object),
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByEmail', () => {
        it('should return a user by email', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findByEmail('test@example.com');

            expect(result).toBeDefined();
            if (result) {
                expect(result.email).toBe('test@example.com');
            }
            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
                include: expect.any(Object),
            });
        });
    });

    describe('update', () => {
        const updateUserDto = {
            firstName: 'Updated',
            lastName: 'Name',
        };

        it('should update a user successfully', async () => {
            const updatedUser = { ...mockUser, ...updateUserDto };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue(updatedUser);

            const result = await service.update('1', updateUserDto);

            expect(result.firstName).toBe('Updated');
            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: updateUserDto,
                include: expect.any(Object),
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.update('999', updateUserDto)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should hash password if provided in update', async () => {
            const updateWithPassword = { password: 'newPassword' };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
            mockPrismaService.user.update.mockResolvedValue(mockUser);

            await service.update('1', updateWithPassword);

            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
        });
    });

    describe('remove', () => {
        it('should delete a user successfully', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.delete.mockResolvedValue(mockUser);

            await service.remove('1');

            expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
        });
    });
});
