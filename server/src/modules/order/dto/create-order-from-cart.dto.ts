import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderFromCartDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
