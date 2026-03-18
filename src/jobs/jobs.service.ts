import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
  ) {}

  async create(companyId: string, dto: CreateJobDto): Promise<Job> {
    const job = new this.jobModel({ ...dto, companyId: new Types.ObjectId(companyId) });
    return job.save();
  }

  async update(jobId: string, companyId: string, dto: UpdateJobDto): Promise<Job> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId.toString() !== companyId)
      throw new ForbiddenException('You can only update your own job postings');

    Object.assign(job, dto);
    return job.save();
  }

  async remove(jobId: string, companyId: string): Promise<{ message: string }> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId.toString() !== companyId)
      throw new ForbiddenException('You can only delete your own job postings');

    await job.deleteOne();
    return { message: 'Job deleted successfully' };
  }

  async findById(jobId: string): Promise<Job> {
    const job = await this.jobModel
      .findById(jobId)
      .populate('companyId', '-password -refreshToken')
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async findByCompany(companyId: string): Promise<Job[]> {
    return this.jobModel.find({ companyId: new Types.ObjectId(companyId) }).sort({ createdAt: -1 }).exec();
  }

  async findAll(): Promise<Job[]> {
    return this.jobModel
      .find()
      .populate('companyId', '-password -refreshToken')
      .sort({ createdAt: -1 })
      .exec();
  }

  async apply(jobId: string, userId: string): Promise<{ message: string }> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) throw new NotFoundException('Job not found');

    const alreadyApplied = job.applicants.some(
      (a) => a.userId.toString() === userId,
    );
    if (alreadyApplied) throw new ConflictException('You have already applied to this job');

    job.applicants.push({ userId: new Types.ObjectId(userId), appliedAt: new Date(), status: 'pending' } as any);
    await job.save();
    return { message: 'Application submitted successfully' };
  }

  async getApplicants(jobId: string, companyId: string): Promise<Job['applicants']> {
    const job = await this.jobModel
      .findById(jobId)
      .populate('applicants.userId', '-password -refreshToken')
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId.toString() !== companyId)
      throw new ForbiddenException('Access denied');
    return job.applicants;
  }

  async updateApplicantStatus(
    jobId: string,
    applicantUserId: string,
    status: string,
    companyId: string,
  ): Promise<{ message: string }> {
    const allowed = ['pending', 'reviewed', 'shortlisted', 'rejected'];
    if (!allowed.includes(status))
      throw new BadRequestException(`Status must be one of: ${allowed.join(', ')}`);

    const job = await this.jobModel.findById(jobId).exec();
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId.toString() !== companyId)
      throw new ForbiddenException('Access denied');

    const applicant = job.applicants.find(
      (a) => a.userId.toString() === applicantUserId,
    );
    if (!applicant) throw new NotFoundException('Applicant not found for this job');

    applicant.status = status;
    await job.save();
    return { message: `Applicant status updated to '${status}'` };
  }
}
