import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';

@Injectable()
export class InventoryService {
    constructor(
        @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    ) { }

    async create(createInventoryDto: any): Promise<Inventory> {
        const createdInventory = new this.inventoryModel(createInventoryDto);
        return createdInventory.save();
    }

    async findAll(): Promise<Inventory[]> {
        return this.inventoryModel.find().exec();
    }

    async findOne(id: string): Promise<Inventory> {
        const item = await this.inventoryModel.findById(id).exec();
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }
        return item;
    }

    async delete(id: string): Promise<any> {
        const result = await this.inventoryModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }
        return result;
    }
}
