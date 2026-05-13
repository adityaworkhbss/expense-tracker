import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EmisService } from './emis.service';
import { CreateEmiDto, UpdateEmiDto } from './dto/emi.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('EMIs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emis')
export class EmisController {
  constructor(private readonly emisService: EmisService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new EMI' })
  create(@Request() req, @Body() createEmiDto: CreateEmiDto) {
    return this.emisService.create(req.user.id, createEmiDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all EMIs' })
  findAll(@Request() req) {
    return this.emisService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EMI details' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.emisService.findOne(req.user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update EMI' })
  update(@Request() req, @Param('id') id: string, @Body() updateEmiDto: UpdateEmiDto) {
    return this.emisService.update(req.user.id, id, updateEmiDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete EMI' })
  remove(@Request() req, @Param('id') id: string) {
    return this.emisService.remove(req.user.id, id);
  }
}
