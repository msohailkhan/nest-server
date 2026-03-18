import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export interface StudentProject {
  title: string;
  description: string;
  technologies?: string[];
  projectUrl?: string;
}

export interface StudentDetailPayload {
  phone: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
  experience?: string;
  requiredJob?: string;
  requiredExperience?: string;
  skills: string[];
  projects?: StudentProject[];
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  linkedIn?: string;
}

export class StudentProjectDto implements StudentProject {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @IsOptional()
  @IsUrl()
  projectUrl?: string;
}

export class StudentDetailDto implements StudentDetailPayload {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  requiredJob?: string;

  @IsOptional()
  @IsString()
  requiredExperience?: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentProjectDto)
  projects?: StudentProjectDto[];

  @IsString()
  @IsNotEmpty()
  degree: string;

  @IsString()
  @IsNotEmpty()
  fieldOfStudy: string;

  @IsString()
  @IsNotEmpty()
  graduationYear: string;

  @IsString()
  @IsNotEmpty()
  institution: string;

  @IsOptional()
  @IsUrl()
  linkedIn?: string;
}
