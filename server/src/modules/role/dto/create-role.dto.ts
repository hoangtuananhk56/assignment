import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({ example: 'moderator', description: 'Role name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Moderator with limited permissions', description: 'Role description' })
    @IsString()
    @IsOptional()
    description?: string;
}
