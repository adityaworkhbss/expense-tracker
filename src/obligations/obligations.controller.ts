import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ObligationsService } from './obligations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Obligations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('obligations')
export class ObligationsController {
  constructor(private readonly obligationsService: ObligationsService) {}

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming liabilities and obligations for next 30 days' })
  getUpcoming(@Request() req) {
    return this.obligationsService.getUpcomingObligations(req.user.id);
  }
}
