import { IsString, IsNotEmpty } from 'class-validator';

export class GetConfigDto {
  @IsString()
  @IsNotEmpty()
  appName: string;

  @IsString()
  @IsNotEmpty()
  environment: string;
}

export class UpdateConfigDto {
  @IsString()
  value: string;

  @IsString()
  comment: string;

  @IsString()
  group: string;
}
