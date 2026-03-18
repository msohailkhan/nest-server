import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentDetail, StudentDetailDocument } from './schemas/student-detail.schema';
import { StudentDetailPayload } from './dto/student-detail.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class StudentDetailService {
  constructor(
    @InjectModel(StudentDetail.name)
    private studentDetailModel: Model<StudentDetailDocument>,
    private readonly usersService: UsersService,
  ) {}

  async upsert(userId: string, dto: StudentDetailPayload): Promise<StudentDetail> {
    const detail = await this.studentDetailModel
      .findOneAndUpdate(
        { userId },
        { ...dto, userId },
        { returnDocument: 'after', upsert: true },
      )
      .exec();
    await this.usersService.markProfileCompleted(userId);
    return detail;
  }

  async findByUserId(userId: string): Promise<StudentDetail> {
    const detail = await this.studentDetailModel.findOne({ userId }).exec();
    if (!detail) throw new NotFoundException('Student detail not found');
    return detail;
  }

  async findAll(): Promise<StudentDetail[]> {
    return this.studentDetailModel.find().populate('userId', '-password -refreshToken').exec();
  }
}
