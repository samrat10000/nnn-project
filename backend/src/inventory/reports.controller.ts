import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('inventory/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('materials/csv')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getMaterialsCSV(@Res() res) {
        const csv = await this.reportsService.generateMaterialsCSV();
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=materials_report.csv');
        res.send(csv);
    }

    @Get('materials/pdf')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getMaterialsPDF(@Res() res) {
        const buffer = await this.reportsService.generateMaterialsPDF();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=materials_report.pdf',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('stocks/csv')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getStocksCSV(@Res() res) {
        const csv = await this.reportsService.generateStocksCSV();
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=stocks_report.csv');
        res.send(csv);
    }

    @Get('stocks/pdf')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getStocksPDF(@Res() res) {
        const buffer = await this.reportsService.generateStocksPDF();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=stocks_report.pdf',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
