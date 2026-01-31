import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Stock, StockDocument } from './schemas/stock.schema';

@Injectable()
export class StockService {
    constructor(
        @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    ) { }

    async create(createStockDto: any): Promise<Stock> {
        // ideally check if material exists here
        const createdStock = new this.stockModel(createStockDto);
        return createdStock.save();
    }

    async findAll(): Promise<Stock[]> {
        return this.stockModel.find().populate('materialId').exec();
    }

    async findByMaterial(materialId: string): Promise<Stock[]> {
        return this.stockModel.find({ materialId: materialId as any }).populate('materialId').exec();
    }

    async findOne(id: string): Promise<Stock> {
        const stock = await this.stockModel.findById(id).populate('materialId').exec();
        if (!stock) {
            throw new NotFoundException(`Stock with ID ${id} not found`);
        }
        return stock;
    }

    async update(id: string, updateData: any): Promise<Stock> {
        const updatedStock = await this.stockModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!updatedStock) {
            throw new NotFoundException(`Stock with ID ${id} not found`);
        }
        return updatedStock;
    }

    async remove(id: string): Promise<any> {
        const result = await this.stockModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Stock with ID ${id} not found`);
        }
        return result;
    }
}
