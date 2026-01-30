import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InventoryDocument = HydratedDocument<Inventory>;

@Schema({ timestamps: true })
export class Inventory {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, min: 0 })
    quantity: number;

    @Prop({ required: true, min: 0 })
    price: number;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
