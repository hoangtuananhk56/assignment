import { IsEmail, IsString, IsOptional, MinLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123', minLength: 6, description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'John', description: 'User first name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: '9de8c6b4-b1be-43b3-b3f5-e8fed8d0e4e9', description: 'Role ID for admin registration' })
  @IsUUID()
  @IsOptional()
  roleId: string;

  @ApiPropertyOptional({ example: 'customer', description: 'Role name (optional, defaults to customer)' })
  @IsString()
  @IsOptional()
  roleName?: string;
}
