import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import sgMail from '@sendgrid/mail';
import { User, UserDocument, UserRole, UserStatus } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendgridApiKey) {
      sgMail.setApiKey(sendgridApiKey);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<UserDocument, 'password'>> {
    const existing = await this.userModel.findOne({ email: createUserDto.email });
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role ?? UserRole.STUDENT,
    });
    const saved = await user.save();
    const result = saved.toObject();
    delete (result as any).password;
    return result;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateRefreshToken(userId: string, hashedToken: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashedToken }).exec();
  }

  async addFcmToken(userId: string, token: string): Promise<void> {
    const trimmed = token.trim();
    if (!trimmed) return;

    await this.userModel
      .findByIdAndUpdate(userId, { $addToSet: { fcmTokens: trimmed } })
      .exec();
  }

  async removeFcmTokens(userId: string, tokens: string[]): Promise<void> {
    if (!tokens.length) return;

    await this.userModel
      .findByIdAndUpdate(userId, { $pull: { fcmTokens: { $in: tokens } } })
      .exec();
  }

  async getFcmTokens(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId).select('fcmTokens').lean().exec();
    return user?.fcmTokens ?? [];
  }

  async updateStatus(userId: string, dto: UpdateStatusDto): Promise<User> {
    const existingUser = await this.userModel.findById(userId).exec();
    if (!existingUser) throw new NotFoundException('User not found');

    const nextIsApproved = dto.status === UserStatus.APPROVED;

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { status: dto.status, isApproved: nextIsApproved },
        { returnDocument: 'after' },
      )
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');

    const transitionedToApproved =
      existingUser.status !== UserStatus.APPROVED && dto.status === UserStatus.APPROVED;

    if (transitionedToApproved) {
      await this.sendApprovalEmail(user.email, user.name);
    }

    return user;
  }

  async update(userId: string, updateData: any): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async markProfileCompleted(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { profileCompleted: true }).exec();
  }

  async setResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      resetPasswordToken: token,
      resetPasswordExpiry: expiry,
    }).exec();
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    }).exec();
  }

  async updatePasswordAndClearResetToken(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    }).exec();
  }

  private async sendApprovalEmail(toEmail: string, userName: string): Promise<void> {
    const clientUrl = this.configService.get<string>('CLIENT_URL') ?? 'http://localhost:3000';
    const loginUrl = `${clientUrl.replace(/\/$/, '')}/login`;
    const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') ?? 'noreply@jobbridge.com';

    try {
      console.log('[Users] Sending account approval email...');
      console.log(`  From: ${fromEmail}`);
      console.log(`  To: ${toEmail}`);
      console.log(`  User: ${userName}`);
      await sgMail.send({
        from: fromEmail,
        to: toEmail,
        subject: 'Account Approved',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
            <h2 style="margin-bottom:8px;color:#111827">Your account has been approved</h2>
            <p style="margin-bottom:20px;color:#374151">Hi ${userName}, you are approved by admin. You can now login.</p>
            <a href="${loginUrl}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">
              Login Now
            </a>
          </div>
        `,
      });
      console.log('[Users] ✓ Account approval email sent successfully');
    } catch (error: any) {
      const errorCode = error.code || 'UNKNOWN';
      const errorMessage = error.response?.body?.errors?.[0]?.message || error.message || 'Unknown error';
      console.error('[Users] Failed to send approval email:');
      console.error(`  Code: ${errorCode}`);
      console.error(`  From Email: ${fromEmail}`);
      console.error(`  To Email: ${toEmail}`);
      console.error(`  Message: ${errorMessage}`);
      if (error.response?.body?.errors) {
        console.error(`  Details:`, error.response.body.errors);
      }
    }
  }
}
