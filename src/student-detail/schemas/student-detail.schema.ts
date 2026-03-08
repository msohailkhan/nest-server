import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudentDetailDocument = HydratedDocument<StudentDetail>;

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class StudentDetail {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: Date, required: true })
  dateOfBirth: Date;

  @Prop({ type: String, enum: Gender, required: true })
  gender: Gender;

  @Prop({ type: String, required: true })
  bio: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: String, required: true })
  degree: string;

  @Prop({ type: String, required: true })
  fieldOfStudy: string;

  @Prop({ type: Number, required: true })
  graduationYear: number;

  @Prop({ type: String, required: true })
  institution: string;

  @Prop({ type: String, default: null })
  linkedIn: string | null;
}

export const StudentDetailSchema = SchemaFactory.createForClass(StudentDetail);