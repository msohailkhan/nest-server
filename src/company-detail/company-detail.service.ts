import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanyDetail, CompanyDetailDocument } from './schemas/company-detail.schema';
import { CompanyDetailDto } from './dto/company-detail.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CompanyDetailService {
  constructor(
    @InjectModel(CompanyDetail.name)
    private companyDetailModel: Model<CompanyDetailDocument>,
    private readonly usersService: UsersService,
  ) {}

  async upsert(userId: string, dto: CompanyDetailDto): Promise<CompanyDetail> {
    const detail = await this.companyDetailModel
      .findOneAndUpdate(
        { userId },
        { ...dto, userId },
        { returnDocument: 'after', upsert: true },
      )
      .exec();
    await this.usersService.markProfileCompleted(userId);
    return detail;
  }

  async findByUserId(userId: string): Promise<CompanyDetail> {
    const detail = await this.companyDetailModel.findOne({ userId }).exec();
    if (!detail) throw new NotFoundException('Company detail not found');
    return detail;
  }

  async findAll(): Promise<CompanyDetail[]> {
    return this.companyDetailModel.find().populate('userId', '-password -refreshToken').exec();
  }
}
