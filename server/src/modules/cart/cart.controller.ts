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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser } from '../../common';

@ApiTags('Shopping Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  @ApiOperation({ summary: 'Get current user cart with items, quantities, and total' })
  @ApiResponse({ status: 200, description: 'Returns cart with items and totals' })
  getCart(@CurrentUser() user: any) {
    return this.cartService.getOrCreateCart(user.id);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({ status: 200, description: 'Product added to cart successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  addItem(@CurrentUser() user: any, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(user.id, addToCartDto);
  }

  @Patch('items/:productId')
  updateItem(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, productId, updateCartItemDto);
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK)
  removeItem(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.cartService.removeItem(user.id, productId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
