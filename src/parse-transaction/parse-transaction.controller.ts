import { Controller, Post, Body, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ParseTransactionService } from './parse-transaction.service';
import { ParseTransactionDto } from './dto/parse-transaction.dto';
import { UserCustomizationService } from '../user-customization/user-customization.service';
import { CurrentUser } from '../common';

@ApiTags('Parse Transaction')
@ApiBearerAuth()
@Controller('parse-transaction')
export class ParseTransactionController {
  constructor(
    private readonly parseService: ParseTransactionService,
    private readonly customizationService: UserCustomizationService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Parse natural language text into structured transaction data',
    description:
      'Accepts raw text like "uber 340 yesterday" and returns structured transaction fields. ' +
      'Requires ai_transaction to be enabled in user customization.',
  })
  async parse(
    @CurrentUser('id') userId: string,
    @Body() dto: ParseTransactionDto,
  ) {
    // Gate: check if AI transaction is enabled for this user
    const customization = await this.customizationService.get(userId);
    if (!customization.aiTransaction) {
      throw new ForbiddenException(
        'AI transaction parsing is not enabled. Enable it in user customization settings.',
      );
    }

    return this.parseService.parseTransaction(userId, dto.text);
  }
}
