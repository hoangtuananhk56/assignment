import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPermissionsDto {
    @ApiProperty({
        example: [
            { resource: 'product', action: 'create' },
            { resource: 'product', action: 'update' }
        ],
        description: 'Array of permissions to add to the role'
    })
    @IsArray()
    @IsNotEmpty()
    permissions: Array<{
        resource: string;
        action: string;
    }>;
}
