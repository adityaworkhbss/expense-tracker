import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { CurrentUser } from '../common';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List all accounts' })
  findAll(@CurrentUser('id') userId: string) {
    return this.accountsService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accountsService.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or deactivate an account' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.accountsService.remove(userId, id);
  }
}
