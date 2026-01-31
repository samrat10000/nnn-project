import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from './schemas/material.schema';

@Injectable()
export class MaterialService {
    constructor(
        @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    ) { }

    async create(createMaterialDto: any): Promise<Material> {
        const createdMaterial = new this.materialModel(createMaterialDto);
        return createdMaterial.save();
    }

    async findAll(): Promise<Material[]> {
        return this.materialModel.find().exec();
    }

    async findOne(id: string): Promise<Material> {
        const material = await this.materialModel.findById(id).exec();
        if (!material) {
            throw new NotFoundException(`Material with ID ${id} not found`);
        }
        return material;
    }

    async update(id: string, updateData: any): Promise<Material> {
        const updatedMaterial = await this.materialModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!updatedMaterial) {
            throw new NotFoundException(`Material with ID ${id} not found`);
        }
        return updatedMaterial;
    }

    async remove(id: string): Promise<any> {
        const result = await this.materialModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Material with ID ${id} not found`);
        }
        return result;
    }
}
