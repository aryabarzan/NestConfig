import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('config_metadata')
@Unique('UQ_config_metadata_appName_environment', ['appName', 'environment']) // Add unique constraint
export class ConfigMetadataEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  appName: string;

  @Column()
  environment: string;

  @UpdateDateColumn()
  lastUpdated: Date;
}
