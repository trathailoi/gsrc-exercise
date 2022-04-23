import {
  Module,
  MiddlewareConsumer
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'
import { APP_GUARD, APP_FILTER } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { BullModule } from '@nestjs/bull'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { RedisHealthModule } from '@liaoliaots/nestjs-redis/health'

import { AllExceptionFilter } from './filters/exception.filter'

import { appConfig } from './app.config'

import { HealthController } from './health/health.controller'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { DatabaseModule } from './database/database.module'
import { LoggerModule } from './logger/logger.module'
import LogsMiddleware from './logger/logger.middleware'

import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './auth/jwt-auth.guard'

import { ScraperModule } from './scraper/scraper.module'
import { KeywordModule } from './keyword/keyword.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      validationSchema: appConfig.getGeneralValidationSchema()
    }),
    DatabaseModule,
    LoggerModule,
    TerminusModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        config: appConfig.getRedisConfig()
      })
    }),
    RedisHealthModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        redis: appConfig.getRedisConfig()
      })
    }),
    ThrottlerModule.forRoot({
      ttl: 30, // retry after 30 seconds
      limit: 10 // limit to 10 requests per 30 seconds
    }),
    UserModule,
    AuthModule,
    ScraperModule,
    KeywordModule
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter
    }
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogsMiddleware)
      .exclude(
        appConfig.showHealthLogs() ? '' : `/${appConfig.getGlobalPrefix()}/v${appConfig.getApiVersion()}/health`
      )
      .forRoutes('*')
  }
}
