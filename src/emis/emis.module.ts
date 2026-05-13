import { Module } from '@nestjs/common';
import { EmisService } from './emis.service';
import { EmisController } from './emis.controller';

@Module({
  providers: [EmisService],
  controllers: [EmisController]
})
export class EmisModule {}
