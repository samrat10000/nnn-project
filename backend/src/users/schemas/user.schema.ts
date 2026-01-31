import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
    ADMIN = 'ADMIN',
    WAREHOUSE_WORKER = 'WAREHOUSE_WORKER',
    VIEWER = 'VIEWER',
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ enum: UserRole, default: UserRole.VIEWER })
    role: UserRole;

    @Prop({ type: [String], default: [] })
    permissions: string[];

    @Prop({ required: false })
    refreshTokenHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
