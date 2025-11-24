import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        roleName: 'customer',
        roleId: 'role-1',
        role: {
            id: 'role-1',
            name: 'customer',
            description: 'Customer role',
            permissions: [
                { resource: 'products', action: 'read' },
                { resource: 'orders', action: 'create' },
            ],
        },
    };

    const mockUserService = {
        create: jest.fn(),
        findByEmail: jest.fn(),
        findOne: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        const registerDto = {
            email: 'newuser@example.com',
            password: 'password123',
            firstName: 'Jane',
            lastName: 'Smith',
            roleName: 'customer',
            roleId: 'role-1',
        };

        it('should register a new user successfully', async () => {
            const createdUser = { ...mockUser, email: registerDto.email };
            mockUserService.create.mockResolvedValue(createdUser);
            mockUserService.findByEmail.mockResolvedValue(createdUser);
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.register(registerDto);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('access_token', 'jwt-token');
            expect(result.user.email).toBe(registerDto.email);
            expect(result.user).not.toHaveProperty('password');
            expect(result.user.permissions).toHaveLength(2);
        });

        it('should throw UnauthorizedException if user not found after registration', async () => {
            mockUserService.create.mockResolvedValue(mockUser);
            mockUserService.findByEmail.mockResolvedValue(null);

            await expect(service.register(registerDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('login', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        it('should login user successfully with valid credentials', async () => {
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.login(loginDto);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('access_token', 'jwt-token');
            expect(result.user.email).toBe(loginDto.email);
            expect(result.user).not.toHaveProperty('password');
            expect(result.user.permissions).toHaveLength(2);
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockUserService.findByEmail.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
        });

        it('should format permissions correctly', async () => {
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.login(loginDto);

            expect(result.user.permissions).toEqual([
                { resource: 'products', action: 'read' },
                { resource: 'orders', action: 'create' },
            ]);
        });
    });

    describe('validateUser', () => {
        it('should validate and return user', async () => {
            mockUserService.findOne.mockResolvedValue(mockUser);

            const result = await service.validateUser('1');

            expect(result).toBeDefined();
            expect(result.id).toBe('1');
            expect(mockUserService.findOne).toHaveBeenCalledWith('1');
        });
    });

    describe('generateToken', () => {
        it('should generate JWT token with correct payload', async () => {
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('jwt-token');

            await service.login({ email: 'test@example.com', password: 'password' });

            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
            });
        });
    });
});
