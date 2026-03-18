import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@UseGuards(JwtAccessGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // Company — post a new job
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @Post()
  create(@Req() req: Request, @Body() dto: CreateJobDto) {
    const companyId = (req.user as any).userId;
    return this.jobsService.create(companyId, dto);
  }

  // Company — update own job
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ) {
    const companyId = (req.user as any).userId;
    return this.jobsService.update(id, companyId, dto);
  }

  // Company — delete own job
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const companyId = (req.user as any).userId;
    return this.jobsService.remove(id, companyId);
  }

  // Company — list own jobs
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @Get('mine')
  getMyJobs(@Req() req: Request) {
    const companyId = (req.user as any).userId;
    return this.jobsService.findByCompany(companyId);
  }

  // Any authenticated user — list all published jobs (for student job board)
  @Get('all')
  findAllPublic() {
    return this.jobsService.findAll();
  }

  // Any authenticated user — get job by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

  // Admin — get all jobs
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  // Student — apply to a job
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post(':id/apply')
  apply(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any).userId;
    return this.jobsService.apply(id, userId);
  }

  // Company — get all applicants for own job
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @Get(':id/applicants')
  getApplicants(@Req() req: Request, @Param('id') id: string) {
    const companyId = (req.user as any).userId;
    return this.jobsService.getApplicants(id, companyId);
  }

  // Company — update applicant status
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @Patch(':id/applicants/:applicantUserId/status')
  updateApplicantStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('applicantUserId') applicantUserId: string,
    @Body('status') status: string,
  ) {
    const companyId = (req.user as any).userId;
    return this.jobsService.updateApplicantStatus(id, applicantUserId, status, companyId);
  }
}
