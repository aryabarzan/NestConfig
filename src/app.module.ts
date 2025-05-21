import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ClsMiddleware, ClsModule } from 'nestjs-cls';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppsConfigModule } from './apps-config/apps-config.moule';
import { AuthModule } from './auth/auth.module';
import { RequestContextMiddleWare } from './common/middleware';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: false,
        generateId: true,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    PrometheusModule.register(),
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASS'),
        database: configService.get('DATABASE_NAME'),
        logging: false,
        synchronize: true,
        entities: [`${__dirname}/**/*.entity.{js,ts}`],
      }),
    }),
    AppsConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClsMiddleware, RequestContextMiddleWare).forRoutes('*');
  }
}
