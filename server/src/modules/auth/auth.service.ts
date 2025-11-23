import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    const token = this.generateToken(user.id, user.email);

    // Get user with permissions
    const userWithPermissions = await this.userService.findByEmail(user.email);
    if (!userWithPermissions) {
      throw new UnauthorizedException('User not found after registration');
    }

    const { password, ...userData } = userWithPermissions;

    // Format permissions for frontend
    const permissions = userWithPermissions.role?.permissions?.map(p => ({
      resource: p.resource,
      action: p.action,
    })) || [];

    // Remove permissions from role and password from user
    const { role, ...userDataWithoutRole } = userData;
    const roleWithoutPermissions = role ? { ...role, permissions: undefined } : undefined;

    return {
      user: {
        ...userDataWithoutRole,
        role: roleWithoutPermissions,
        permissions,
      },
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);

    const { password, ...userWithoutPassword } = user;

    // Format permissions for frontend
    const permissions = user.role?.permissions?.map(p => ({
      resource: p.resource,
      action: p.action,
    })) || [];

    return {
      user: {
        ...userWithoutPassword,
        permissions,
      },
      access_token: token,
    };
  }

  async validateUser(id: string) {
    return this.userService.findOne(id);
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
