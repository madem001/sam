import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role: registerDto.role,
        avatar: registerDto.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        points: true,
        level: true,
        streak: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user.id, user.email, user.role);

    return { user, token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getUserById(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        points: true,
        level: true,
        streak: true,
        createdAt: true,
      },
    });
  }

  async updateUser(userId: string, data: { name?: string; avatar?: string }) {
    return await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        points: true,
        level: true,
        streak: true,
        createdAt: true,
      },
    });
  }

  async getAllStudents() {
    return await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        points: true,
        level: true,
        streak: true,
      },
    });
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = {
      userId,
      email,
      role,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string) {
    return this.getUserById(userId);
  }
}
