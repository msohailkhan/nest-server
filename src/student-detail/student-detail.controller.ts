import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { StudentDetailService } from './student-detail.service';
import { StudentDetailDto } from './dto/student-detail.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@UseGuards(JwtAccessGuard)
@Controller('student-detail')
export class StudentDetailController {
  constructor(private readonly studentDetailService: StudentDetailService) {}

  // Student — create or update own detail
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post()
  upsert(@Req() req: Request, @Body() dto: StudentDetailDto) {
    const userId = (req.user as any).userId;
    return this.studentDetailService.upsert(userId, dto);
  }

  // Student — get own detail
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get('me')
  getOwn(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.studentDetailService.findByUserId(userId);
  }

  // Admin — list all student details
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.studentDetailService.findAll();
  }

  // Admin / Company — get student detail by userId
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.studentDetailService.findByUserId(userId);
  }
}
