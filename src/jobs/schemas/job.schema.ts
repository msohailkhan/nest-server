import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type JobDocument = HydratedDocument<Job>;

export class Applicant {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Date, default: () => new Date() })
  appliedAt: Date;

  @Prop({ type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected'], default: 'pending' })
  status: string;
}

export enum JobType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  REMOTE = 'Remote',
  CONTRACT = 'Contract',
  INTERNSHIP = 'Internship',
}

@Schema({ timestamps: true })
export class Job {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true, trim: true })
  location: string;

  @Prop({ type: String, enum: JobType, required: true })
  type: JobType;

  @Prop({ type: String, required: true })
  salary: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, required: true })
  experience: string;

  @Prop({ type: String, required: true })
  deadline: string;

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ type: [String], default: [] })
  responsibilities: string[];

  @Prop({ type: [String], default: [] })
  benefits: string[];

  @Prop({ type: [{ userId: { type: Types.ObjectId, ref: 'User' }, appliedAt: { type: Date, default: () => new Date() }, status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected'], default: 'pending' } }], default: [] })
  applicants: Applicant[];
}

export const JobSchema = SchemaFactory.createForClass(Job);
