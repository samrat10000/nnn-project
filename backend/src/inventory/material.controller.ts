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
import { MaterialService } from './material.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialController {
    constructor(private readonly materialService: MaterialService) { }

    @Post()
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN)
    @Permissions('material.create')
    create(@Body() body: any) {
        return this.materialService.create(body);
    }

    @Get()
    findAll() {
        return this.materialService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.materialService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN)
    @Permissions('material.update')
    update(@Param('id') id: string, @Body() body: any) {
        return this.materialService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(UserRole.ADMIN)
    @Permissions('material.delete')
    remove(@Param('id') id: string) {
        return this.materialService.remove(id);
    }
}
