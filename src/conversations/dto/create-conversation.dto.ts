import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  participantId: string;
}