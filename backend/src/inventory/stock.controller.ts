import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('stocks')
@UseGuards(JwtAuthGuard)
export class StockController {
    constructor(private readonly stockService: StockService) { }

    @Post()
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_WORKER)
    @Permissions('stock.create')
    create(@Body() body: any) {
        return this.stockService.create(body);
    }

    @Get()
    findAll() {
        return this.stockService.findAll();
    }

    @Get('material/:materialId')
    findByMaterial(@Param('materialId') materialId: string) {
        return this.stockService.findByMaterial(materialId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.stockService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN, UserRole.WAREHOUSE_WORKER)
    @Permissions('stock.update')
    update(@Param('id') id: string, @Body() body: any) {
        return this.stockService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN)
    @Permissions('stock.delete')
    remove(@Param('id') id: string) {
        return this.stockService.remove(id);
    }
}
