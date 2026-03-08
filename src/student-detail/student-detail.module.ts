import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentDetailController } from './student-detail.controller';
import { StudentDetailService } from './student-detail.service';
import { StudentDetail, StudentDetailSchema } from './schemas/student-detail.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StudentDetail.name, schema: StudentDetailSchema }]),
    UsersModule,
  ],
  controllers: [StudentDetailController],
  providers: [StudentDetailService],
})
export class StudentDetailModule {}
