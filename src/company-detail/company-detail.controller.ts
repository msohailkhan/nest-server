import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CompanyDetailService } from './company-detail.service';
import { CompanyDetailDto } from './dto/company-detail.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@UseGuards(JwtAccessGuard)
@Controller('company-detail')
export class CompanyDetailController {
  constructor(private readonly companyDetailService: CompanyDetailService) {}

  // Company — create or update own detail
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @Post()
  upsert(@Req() req: Request, @Body() dto: CompanyDetailDto) {
    const userId = (req.user as any).userId;
    return this.companyDetailService.upsert(userId, dto);
  }

  // Company — get own detail
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @Get('me')
  getOwn(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.companyDetailService.findByUserId(userId);
  }

  // Admin — list all company details
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.companyDetailService.findAll();
  }

  // Admin — get company detail by userId
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.companyDetailService.findByUserId(userId);
  }
}
