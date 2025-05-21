import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigMetadataEntity } from './entities/config-metadata.entity';
import { ConfigEntity } from './entities/config.entity';

@Injectable()
export class AppsConfigService {
  constructor(
    @InjectRepository(ConfigEntity)
    private readonly configRepository: Repository<ConfigEntity>,
    @InjectRepository(ConfigMetadataEntity)
    private readonly configMetadataRepository: Repository<ConfigMetadataEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getDistinctAppNames(): Promise<string[]> {
    const appNames = await this.configRepository
      .createQueryBuilder('config')
      .select('DISTINCT config.appName', 'appName')
      .getRawMany();

    return appNames.map((item) => item.appName);
  }

  async getConfigs(
    appName: string,
    environment: string,
    lastUpdated: Date,
  ): Promise<{ configs: ConfigEntity[]; newLastUpdated: Date }> {
    // Fetch the last updated time from the metadata table
    const metadata = await this.configMetadataRepository.findOne({
      where: { appName, environment },
    });

    if (!metadata) {
      throw new NotFoundException(
        `No configurations found for app: ${appName}, environment: ${environment}`,
      );
    }

    if (new Date(metadata.lastUpdated) < lastUpdated) {
      throw new ConflictException(
        `Client's lastUpdated time is newer than the server's lastUpdated time for app: ${appName}, environment: ${environment}`,
      );
    }

    if (new Date(metadata.lastUpdated).getTime() === lastUpdated.getTime()) {
      // No changes, return the same lastUpdated time
      return { configs: [], newLastUpdated: lastUpdated };
    }

    // Fetch the latest configurations
    const configs = await this.configRepository.find({
      where: { appName, environment },
      order: { group: 'ASC' },
    });

    return {
      configs,
      newLastUpdated: metadata.lastUpdated,
    };
  }

  async setConfig(
    appName: string,
    environment: string,
    key: string,
    value: string,
    comment: string,
    group: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update or insert the configuration
      const config = await queryRunner.manager.upsert(
        ConfigEntity,
        { appName, environment, key, value, comment, group },
        ['appName', 'environment', 'key'],
      );

      const lastUpdated =
        config?.generatedMaps[0]['updatedAt'] ?? new Date().toISOString();

      // Update the last updated time in the metadata table
      await queryRunner.manager.upsert(
        ConfigMetadataEntity,
        { appName, environment, lastUpdated },
        ['appName', 'environment'],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
