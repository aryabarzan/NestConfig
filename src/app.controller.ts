import { Controller, Get, HttpStatus, Res, UseFilters } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './common/filters';

@UseFilters(AllExceptionsFilter)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getEcho(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .contentType('text/plain; charset=UTF-8')
      .send('UP');
  }

  @ApiExcludeEndpoint()
  @Get('/health')
  async getHealth(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .contentType('text/plain; charset=UTF-8')
      .send('OK');
  }
}
