import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from './schemas/material.schema';
import { Stock, StockDocument } from './schemas/stock.schema';
import { Parser } from 'json2csv';
const PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
        @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    ) { }

    async generateMaterialsCSV(): Promise<string> {
        const materials = await this.materialModel.find().populate('dimensions').exec();
        // Since dimensions is embedded, it's already there. 
        // We need to flatten the object slightly or json2csv handles dot notation.

        // json2csv handles dot notation automatically if we specify fields, 
        // or we can map it manually for cleaner headers.
        const data = materials.map(m => ({
            Name: m.name,
            Description: m.description,
            Type: m.type,
            Weight_KG: m.weight,
            Length: m.dimensions?.length,
            Width: m.dimensions?.width,
            Height: m.dimensions?.height,
            Unit: m.dimensions?.unit,
        }));

        const fields = ['Name', 'Description', 'Type', 'Weight_KG', 'Length', 'Width', 'Height', 'Unit'];
        const json2csvParser = new Parser({ fields });
        return json2csvParser.parse(data);
    }

    async generateMaterialsPDF(): Promise<Buffer> {
        const materials = await this.materialModel.find().exec();

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header
            doc.fontSize(20).text('Materials Catalog Report', { align: 'center' });
            doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();

            // Divider
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Content
            materials.forEach((material, index) => {
                // Check if we need a new page
                if (doc.y > 700) doc.addPage();

                doc.fontSize(14).fillColor('#000000').text(`${index + 1}. ${material.name}`, { bold: true });
                doc.fontSize(10).fillColor('#444444');

                doc.text(`Type: ${material.type}`, { indent: 20 });
                doc.text(`Description: ${material.description || 'N/A'}`, { indent: 20 });
                doc.text(`Weight: ${material.weight} kg`, { indent: 20 });
                doc.text(`Dimensions: ${material.dimensions?.length} x ${material.dimensions?.width} x ${material.dimensions?.height} ${material.dimensions?.unit}`, { indent: 20 });

                doc.moveDown(0.5);
            });

            doc.end();
        });
    }

    async generateStocksCSV(): Promise<string> {
        const stocks = await this.stockModel.find().populate('materialId').exec();

        const data = stocks.map(stock => {
            const material = stock.materialId as unknown as Material;
            return {
                Material: material?.name || 'Unknown',
                Quantity: stock.quantity,
                Location: stock.location,
                Batch: stock.batchNumber || '',
                Serial: stock.serialNumber || '',
                Expiry: stock.expiryDate ? new Date(stock.expiryDate).toISOString().split('T')[0] : '',
                Created: stock['createdAt'] ? new Date(stock['createdAt']).toISOString() : ''
            };
        });

        const fields = ['Material', 'Quantity', 'Location', 'Batch', 'Serial', 'Expiry', 'Created'];
        const json2csvParser = new Parser({ fields });
        return json2csvParser.parse(data);
    }

    async generateStocksPDF(): Promise<Buffer> {
        const stocks = await this.stockModel.find().populate('materialId').exec();

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            doc.fontSize(20).text('Current Stock Report', { align: 'center' });
            doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();

            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            stocks.forEach((stock, index) => {
                const material = stock.materialId as unknown as Material;

                if (doc.y > 680) doc.addPage();

                doc.fontSize(12).fillColor('#000000').text(`Stock Item #${index + 1}`, { bold: true });
                doc.fontSize(10).fillColor('#444444');

                // Two columns layout roughly
                const leftX = 70;
                const rightX = 300;
                const startY = doc.y;

                doc.text(`Material: ${material?.name || 'Unknown'}`, leftX, startY);
                doc.text(`Quantity: ${stock.quantity}`, rightX, startY);

                doc.text(`Location: ${stock.location}`, leftX, doc.y);
                doc.text(`Batch: ${stock.batchNumber || '-'}`, rightX, doc.y - 12); // adjusting Y manually can be tricky, stick to flow

                // Improve layout: simple list
                doc.text(`Location: ${stock.location}`, { indent: 20 });
                doc.text(`Batch / Serial: ${stock.batchNumber || 'N/A'} / ${stock.serialNumber || 'N/A'}`, { indent: 20 });
                doc.text(`Expiry Date: ${stock.expiryDate ? new Date(stock.expiryDate).toDateString() : 'N/A'}`, { indent: 20 });

                doc.moveDown(0.5);
                doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);
            });

            doc.end();
        });
    }
}
