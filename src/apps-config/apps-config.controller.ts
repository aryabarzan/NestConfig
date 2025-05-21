import { Body, Controller, Get, Param, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppsConfigService } from './apps-config.service';
import { GetConfigDto, UpdateConfigDto } from './dto/config.dto';
import { ConfigEntity } from './entities/config.entity';

@Controller('config')
export class AppsConfigController {
  constructor(private readonly appsConfigService: AppsConfigService) {}

  @Get('appNames')
  async getAppNames(): Promise<string[]> {
    return this.appsConfigService.getDistinctAppNames();
  }

  @Get(':appName/:environment')
  @UsePipes(new ValidationPipe({ transform: true })) // Enable validation and transformation
  async getConfigs(
    @Param() params: GetConfigDto,
    @Query('lastUpdated') lastUpdated: string,
  ): Promise<{ configs: ConfigEntity[]; newLastUpdated: Date }> {
    const lastUpdatedDate = new Date(lastUpdated);
    return this.appsConfigService.getConfigs(
      params.appName,
      params.environment,
      lastUpdatedDate,
    );
  }

  @Put(':appName/:environment/:key')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateConfig(
    @Param() params: GetConfigDto,
    @Param('key') key: string,
    @Body() updateConfigDto: UpdateConfigDto,
  ): Promise<void> {
    await this.appsConfigService.setConfig(
      params.appName,
      params.environment,
      key,
      updateConfigDto.value,
      updateConfigDto.comment,
      updateConfigDto.group,
    );
  }
}
