import { Module } from '@nestjs/common';
import { UserCustomizationController } from './user-customization.controller';
import { UserCustomizationService } from './user-customization.service';

@Module({
  controllers: [UserCustomizationController],
  providers: [UserCustomizationService],
  exports: [UserCustomizationService],
})
export class UserCustomizationModule {}
