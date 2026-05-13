import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto, UpdateCreditCardDto } from './dto/credit-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Credit Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credit-cards')
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new credit card' })
  create(@Request() req, @Body() createCreditCardDto: CreateCreditCardDto) {
    return this.creditCardsService.create(req.user.id, createCreditCardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all credit cards' })
  findAll(@Request() req) {
    return this.creditCardsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credit card details' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.creditCardsService.findOne(req.user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update credit card' })
  update(@Request() req, @Param('id') id: string, @Body() updateCreditCardDto: UpdateCreditCardDto) {
    return this.creditCardsService.update(req.user.id, id, updateCreditCardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete credit card' })
  remove(@Request() req, @Param('id') id: string) {
    return this.creditCardsService.remove(req.user.id, id);
  }
}
