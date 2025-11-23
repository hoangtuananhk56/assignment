import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AddPermissionsDto } from './dto/add-permissions.dto';
import { Roles } from '../../common';

@ApiTags('Roles & Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
export class RoleController {
    constructor(private readonly roleService: RoleService) { }

    @Post()
    @Roles('admin')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new role (Admin only)' })
    @ApiResponse({ status: 201, description: 'Role created successfully' })
    @ApiResponse({ status: 409, description: 'Role already exists' })
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto);
    }

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Get all roles with permissions (Admin only)' })
    @ApiResponse({ status: 200, description: 'Returns all roles' })
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.roleService.findAll(page, limit);
    }

    @Get(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Get role by ID with permissions and users (Admin only)' })
    @ApiResponse({ status: 200, description: 'Returns role details' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    findOne(@Param('id') id: string) {
        return this.roleService.findOne(id);
    }

    @Patch(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Update role (Admin only)' })
    @ApiResponse({ status: 200, description: 'Role updated successfully' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.roleService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete role (Admin only)' })
    @ApiResponse({ status: 204, description: 'Role deleted successfully' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    @ApiResponse({ status: 409, description: 'Cannot delete role with assigned users' })
    remove(@Param('id') id: string) {
        return this.roleService.remove(id);
    }

    @Post(':id/permissions')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Add permissions to role (Admin only)' })
    @ApiResponse({ status: 200, description: 'Permissions added successfully' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    addPermissions(@Param('id') id: string, @Body() addPermissionsDto: AddPermissionsDto) {
        return this.roleService.addPermissions(id, addPermissionsDto);
    }

    @Delete(':id/permissions/:permissionId')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove permission from role (Admin only)' })
    @ApiResponse({ status: 200, description: 'Permission removed successfully' })
    @ApiResponse({ status: 404, description: 'Role or permission not found' })
    removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
        return this.roleService.removePermission(id, permissionId);
    }
}
