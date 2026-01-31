import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MaterialDocument = HydratedDocument<Material>;

@Schema({ _id: false })
class Dimensions {
    @Prop({ required: true })
    length: number;

    @Prop({ required: true })
    width: number;

    @Prop({ required: true })
    height: number;

    @Prop({ required: true, default: 'cm' })
    unit: string;
}

@Schema({ timestamps: true })
export class Material {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: false })
    description: string;

    @Prop({ required: true })
    type: string; // e.g. 'RAW', 'FINISHED'

    @Prop({ type: Dimensions })
    dimensions: Dimensions;

    @Prop({ required: false })
    weight: number; // in kg
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
