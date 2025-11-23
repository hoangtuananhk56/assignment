import { IsString, IsOptional, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Latest iPhone with advanced features', description: 'Product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 999.99, description: 'Product price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50, description: 'Available stock quantity', minimum: 0 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ example: 'abc-123-def-456', description: 'Category ID' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
