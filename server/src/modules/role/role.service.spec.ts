import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('RoleService', () => {
    let service: RoleService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        role: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        user: {
            count: jest.fn(),
        },
        permission: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            createMany: jest.fn(),
            delete: jest.fn(),
        },
        $transaction: jest.fn(),
    };

    const mockRole = {
        id: '1',
        name: 'admin',
        description: 'Administrator role',
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [
            { id: 'perm-1', resource: 'users', action: 'create' },
            { id: 'perm-2', resource: 'users', action: 'read' },
        ],
        _count: { users: 5 },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<RoleService>(RoleService);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createRoleDto = {
            name: 'moderator',
            description: 'Moderator role',
        };

        it('should create a new role successfully', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(null);
            mockPrismaService.role.create.mockResolvedValue(mockRole);

            const result = await service.create(createRoleDto);

            expect(result).toBeDefined();
            expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({
                where: { name: createRoleDto.name },
            });
            expect(mockPrismaService.role.create).toHaveBeenCalledWith({
                data: createRoleDto,
                include: { permissions: true },
            });
        });

        it('should throw ConflictException if role already exists', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole);

            await expect(service.create(createRoleDto)).rejects.toThrow(
                ConflictException,
            );
            await expect(service.create(createRoleDto)).rejects.toThrow(
                'Role already exists',
            );
        });
    });

    describe('findAll', () => {
        it('should return paginated roles', async () => {
            const mockRoles = [mockRole];
            mockPrismaService.role.findMany.mockResolvedValue(mockRoles);
            mockPrismaService.role.count.mockResolvedValue(1);

            const result = await service.findAll(1, 10);

            expect(result.data).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.totalPages).toBe(1);
        });

        it('should handle pagination correctly', async () => {
            mockPrismaService.role.findMany.mockResolvedValue([]);
            mockPrismaService.role.count.mockResolvedValue(25);

            const result = await service.findAll(2, 10);

            expect(mockPrismaService.role.findMany).toHaveBeenCalledWith({
                include: expect.any(Object),
                orderBy: { name: 'asc' },
                skip: 10,
                take: 10,
            });
            expect(result.pagination.totalPages).toBe(3);
        });
    });

    describe('findOne', () => {
        it('should return a role by id', async () => {
            const roleWithUsers = {
                ...mockRole,
                users: [
                    { id: '1', email: 'user@example.com', firstName: 'John', lastName: 'Doe' },
                ],
            };
            mockPrismaService.role.findUnique.mockResolvedValue(roleWithUsers);

            const result = await service.findOne('1');

            expect(result).toBeDefined();
            expect(result.id).toBe('1');
            expect(result.users).toHaveLength(1);
            expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: expect.any(Object),
            });
        });

        it('should throw NotFoundException if role not found', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
            await expect(service.findOne('999')).rejects.toThrow(
                'Role with ID 999 not found',
            );
        });
    });

    describe('update', () => {
        const updateRoleDto = {
            name: 'super-admin',
            description: 'Super Administrator',
        };

        it('should update a role successfully', async () => {
            const updatedRole = { ...mockRole, ...updateRoleDto };
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
            mockPrismaService.role.update.mockResolvedValue(updatedRole);

            const result = await service.update('1', updateRoleDto);

            expect(result.name).toBe('super-admin');
            expect(mockPrismaService.role.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: updateRoleDto,
                include: { permissions: true },
            });
        });

        it('should throw NotFoundException if role not found', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(null);

            await expect(service.update('999', updateRoleDto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('remove', () => {
        it('should delete a role successfully', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
            mockPrismaService.user.count.mockResolvedValue(0);
            mockPrismaService.role.delete.mockResolvedValue(mockRole);

            await service.remove('1');

            expect(mockPrismaService.user.count).toHaveBeenCalledWith({
                where: { roleId: '1' },
            });
            expect(mockPrismaService.role.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });

        it('should throw NotFoundException if role not found', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(null);

            await expect(service.remove('999')).rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException if role has assigned users', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
            mockPrismaService.user.count.mockResolvedValue(5);

            await expect(service.remove('1')).rejects.toThrow(ConflictException);
            await expect(service.remove('1')).rejects.toThrow(
                'Cannot delete role with assigned users',
            );
        });
    });

    describe('addPermissions', () => {
        const addPermissionsDto = {
            permissions: [
                { resource: 'products', action: 'create' },
                { resource: 'products', action: 'update' },
            ],
        };

        it('should add permissions to role successfully', async () => {
            const roleWithPermissions = mockRole;
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
            mockPrismaService.permission.createMany.mockResolvedValue({ count: 2 });

            const result = await service.addPermissions('1', addPermissionsDto);

            expect(mockPrismaService.permission.createMany).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        roleId: '1',
                        resource: 'products',
                        action: 'create',
                    }),
                ]),
                skipDuplicates: true,
            });
            expect(result).toBeDefined();
        });

        it('should throw NotFoundException if role not found', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(null);

            await expect(
                service.addPermissions('999', addPermissionsDto),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('removePermission', () => {
        it('should remove permission from role successfully', async () => {
            const permissionId = 'perm-1';
            const existingPermission = {
                id: permissionId,
                roleId: '1',
                resource: 'PRODUCT',
                action: 'DELETE',
            };

            mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
            mockPrismaService.permission.findFirst.mockResolvedValue(existingPermission);
            mockPrismaService.permission.delete.mockResolvedValue(existingPermission);

            const result = await service.removePermission('1', permissionId);

            expect(mockPrismaService.permission.findFirst).toHaveBeenCalledWith({
                where: { id: permissionId, roleId: '1' },
            });
            expect(mockPrismaService.permission.delete).toHaveBeenCalledWith({
                where: { id: permissionId },
            });
            expect(result).toBeDefined();
        });

        it('should throw NotFoundException if role not found', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(null);

            await expect(service.removePermission('999', 'perm-1')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
