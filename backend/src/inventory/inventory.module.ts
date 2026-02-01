import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { Material, MaterialSchema } from './schemas/material.schema';
import { Stock, StockSchema } from './schemas/stock.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Inventory.name, schema: InventorySchema },
            { name: Material.name, schema: MaterialSchema },
            { name: Stock.name, schema: StockSchema },
        ]),
    ],
    controllers: [
        InventoryController,
        MaterialController,
        StockController,
        ReportsController
    ],
    providers: [
        InventoryService,
        MaterialService,
        StockService,
        ReportsService
    ],
})
export class InventoryModule { }
