import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Unique } from 'typeorm';

@Entity('config')
@Unique('UQ_config_appName_environment_key', ['appName', 'environment', 'key']) // Add this line
export class ConfigEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  appName: string;

  @Column()
  environment: string;

  @Column()
  key: string;

  @Column()
  value: string;

  @Column()
  comment: string;

  @Column()
  group: string;

  @UpdateDateColumn()
  updatedAt: Date;
}