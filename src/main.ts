import {
  createElasticSearchOptions,
  LogConfig,
} from '@crowdswap/infrastructure';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import { ClsService } from 'nestjs-cls';
import fetch, { Headers, Request, Response } from 'node-fetch';
import * as winston from 'winston';
import {
  ElasticsearchTransport,
  ElasticsearchTransportOptions,
} from 'winston-elasticsearch';
import { AppModule } from './app.module';

import * as os from 'os';

const logger = new Logger('Bootstrap');

function configureLogger(app: INestApplication) {
  const config = app.get(ConfigService);
  const clsService = app.get(ClsService);

  const logConfig: LogConfig = {
    appName: 'config',
    logLevel: config.get<string>('LOG_LEVEL'),
    elasticURI: config.get<string>('ELK_ADDRESS'),
  };

  const esTransportOpts: ElasticsearchTransportOptions =
    createElasticSearchOptions(logConfig);

  const defaultLogFields = {
    get correlationId() {
      const requestInfo = clsService.get('requestInfo');
      return requestInfo?.correlationId;
    },
    get wallet() {
      const requestInfo = clsService.get('requestInfo');
      return requestInfo?.wallet;
    },
    get path() {
      const requestInfo = clsService.get('requestInfo');
      return requestInfo?.path;
    },
    get userAgent() {
      const requestInfo = clsService.get('requestInfo');
      return requestInfo?.userAgent;
    },
    get hostname() {
      return os?.hostname();
    },
  };

  const appLogger = WinstonModule.createLogger({
    defaultMeta: defaultLogFields,
    transports: [
      process.env.NODE_ENV !== 'development'
        ? new ElasticsearchTransport(esTransportOpts)
        : new winston.transports.Console({
            level: config.get('LOG_LEVEL', 'debug'),
          }),
    ],
  });
  app.useLogger(appLogger);
}

function configureSwagger(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Api documentation')
    .setDescription('The API used to show dex info of CrowdSwap')
    .setVersion('1.0')
    .addTag('coingecko')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs/swagger', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.use(cookieParser());

  configureLogger(app);

  configureSwagger(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: false,
      errorHttpStatusCode: 400,
    }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 5545;

  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`App is running on ${await app.getUrl()}`);
}

function polyfillFetch() {
  if (!globalThis.fetch) {
    console.log('polyfill fetch for node < 18');
    const globalCopy: any = globalThis;
    globalCopy.fetch = fetch;
    globalCopy.Headers = Headers;
    globalCopy.Request = Request;
    globalCopy.Response = Response;
  }
}

polyfillFetch();
bootstrap();

process
  .on('unhandledRejection', (reason, p) => {
    logger.error(
      JSON.stringify({
        reason:
          reason instanceof Error
            ? { message: reason.message, stack: reason.stack }
            : reason,
        error: 'Unhandled Rejection at Promise',
        p: p,
      }),
    );
  })
  .on('uncaughtException', (err) => {
    logger.error(
      JSON.stringify({ err: err, message: 'Uncaught Exception thrown' }),
    );
    setTimeout(() => process.exit(1), 5000);
  });
