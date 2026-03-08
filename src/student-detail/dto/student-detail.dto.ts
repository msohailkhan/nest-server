import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { Gender } from '../schemas/student-detail.schema';

export class StudentDetailDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsString()
  @IsNotEmpty()
  degree: string;

  @IsString()
  @IsNotEmpty()
  fieldOfStudy: string;

   @IsString()
  graduationYear: string;

  @IsString()
  @IsNotEmpty()
  institution: string;

  @IsOptional()
  @IsUrl()
  linkedIn?: string;
}
