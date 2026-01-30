import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('inventory')
@UseGuards(JwtAuthGuard) // Protects ALL endpoints
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    findAll() {
        return this.inventoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.inventoryService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN) // Only ADMIN can create
    create(@Body() body: any) {
        return this.inventoryService.create(body);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() body: any) {
        return this.inventoryService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN) // Only ADMIN can delete
    remove(@Param('id') id: string) {
        return this.inventoryService.delete(id);
    }
}
