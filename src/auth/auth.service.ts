import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserStatus } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ─── Login ────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException('Your account is pending approval. Please wait for an admin to approve your account.');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked. Please contact support.');
    }

    const tokens = await this.generateTokens(
      (user._id as any).toString(),
      user.email,
      user.role,
      user.profileCompleted,
    );
    await this.storeRefreshToken((user._id as any).toString(), tokens.refreshToken);

    const { password, refreshToken: _rt, ...userDetails } = (user as any).toObject ? (user as any).toObject() : user;
    return { ...tokens, user: userDetails };
  }

  // ─── Refresh tokens ───────────────────────────────────────────────────────
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access denied');

    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatch) throw new ForbiddenException('Access denied');

    const tokens = await this.generateTokens(
      (user._id as any).toString(),
      user.email,
      user.role,
      user.profileCompleted,
    );
    await this.storeRefreshToken((user._id as any).toString(), tokens.refreshToken);

    return { ...tokens, name: user.name, email: user.email, role: user.role, profileCompleted: user.profileCompleted };
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private async generateTokens(userId: string, email: string, role: string, profileCompleted: boolean) {
    const payload = { sub: userId, email, role, profileCompleted };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')!;
    const accessExpires = this.configService.get<string>('JWT_ACCESS_EXPIRES')!;
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
    const refreshExpires = this.configService.get<string>('JWT_REFRESH_EXPIRES')!;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpires as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpires as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashed);
  }
}
