import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CompanyDetailDocument = HydratedDocument<CompanyDetail>;

@Schema({ timestamps: true })
export class CompanyDetail {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;

    @Prop({ type: String, required: true })
    companyName: string;

    @Prop({ type: String, required: true })
    contactEmail: string;

    @Prop({ type: String, required: true })
    industry: string;

    @Prop({ type: String, default: null })
    website?: string | null;

    @Prop({ type: String, default: null })
    linkedIn?: string | null;

    @Prop({ type: String, default: null })
    description?: string | null;

    @Prop({ type: String, default: null })
    address?: string | null;

    @Prop({ type: String, default: null })
    phone?: string | null;

    @Prop({ type: String, default: null })
    foundedYear?: string | null;

    @Prop({ type: String, default: null })
    companysize?: string | null;

    @Prop({ type: String, default: null })
    size?: string | null;

    @Prop({ type: String, default: null })
    location?: string | null;

}

export const CompanyDetailSchema = SchemaFactory.createForClass(CompanyDetail);