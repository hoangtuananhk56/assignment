import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 'abc-123-def-456', description: 'Product ID to add to cart' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity to add', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
