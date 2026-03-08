import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyDetailController } from './company-detail.controller';
import { CompanyDetailService } from './company-detail.service';
import { CompanyDetail, CompanyDetailSchema } from './schemas/company-detail.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CompanyDetail.name, schema: CompanyDetailSchema }]),
    UsersModule,
  ],
  controllers: [CompanyDetailController],
  providers: [CompanyDetailService],
})
export class CompanyDetailModule {}
