import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AddPermissionsDto } from './dto/add-permissions.dto';

@Injectable()
export class RoleService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createRoleDto: CreateRoleDto) {
        const existingRole = await this.prisma.role.findUnique({
            where: { name: createRoleDto.name },
        });

        if (existingRole) {
            throw new ConflictException('Role already exists');
        }

        return this.prisma.role.create({
            data: createRoleDto,
            include: { permissions: true },
        });
    }

    async findAll() {
        return this.prisma.role.findMany({
            include: {
                permissions: true,
                _count: {
                    select: { users: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: true,
                users: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }

        return role;
    }

    async update(id: string, updateRoleDto: UpdateRoleDto) {
        await this.findOne(id);

        return this.prisma.role.update({
            where: { id },
            data: updateRoleDto,
            include: { permissions: true },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        const usersCount = await this.prisma.user.count({
            where: { roleId: id },
        });

        if (usersCount > 0) {
            throw new ConflictException('Cannot delete role with assigned users');
        }

        return this.prisma.role.delete({
            where: { id },
        });
    }

    async addPermissions(id: string, addPermissionsDto: AddPermissionsDto) {
        await this.findOne(id);

        const permissions = addPermissionsDto.permissions.map((p) => ({
            roleId: id,
            resource: p.resource,
            action: p.action,
        }));

        await this.prisma.permission.createMany({
            data: permissions,
            skipDuplicates: true,
        });

        return this.findOne(id);
    }

    async removePermission(id: string, permissionId: string) {
        const role = await this.findOne(id);

        const permission = await this.prisma.permission.findFirst({
            where: {
                id: permissionId,
                roleId: id,
            },
        });

        if (!permission) {
            throw new NotFoundException('Permission not found in this role');
        }

        await this.prisma.permission.delete({
            where: { id: permissionId },
        });

        return this.findOne(id);
    }
}
