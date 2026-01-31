import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Material } from './material.schema';

export type StockDocument = HydratedDocument<Stock>;

@Schema({ timestamps: true })
export class Stock {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Material', required: true })
    materialId: Material;

    @Prop({ required: true, min: 0 })
    quantity: number;

    @Prop({ required: true })
    location: string; // e.g. "A1-B2"

    @Prop({ required: false })
    batchNumber: string;

    @Prop({ required: false })
    serialNumber: string;

    @Prop({ required: false })
    expiryDate: Date;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
