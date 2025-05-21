import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppsConfigController } from './apps-config.controller';
import { AppsConfigService } from './apps-config.service';
import { ConfigEntity, ConfigMetadataEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigEntity, ConfigMetadataEntity])],
  controllers: [AppsConfigController],
  providers: [AppsConfigService],
})
export class AppsConfigModule {}
