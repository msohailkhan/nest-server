import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: String, required: true, unique: true, index: true })
  participantsKey: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User', required: true }],
    required: true,
    validate: {
      validator: (participants: Types.ObjectId[]) => participants.length === 2,
      message: 'Conversation must have exactly 2 participants',
    },
  })
  participants: Types.ObjectId[];

  @Prop({ type: String, default: null })
  lastMessage: string | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  lastMessageSenderId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  lastMessageAt: Date | null;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);