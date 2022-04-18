import {
  Module,
  // RequestMethod,
  MiddlewareConsumer
} from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { TerminusModule } from '@nestjs/terminus'
import { APP_GUARD, APP_FILTER } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
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

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    TerminusModule,
    ConfigModule.forRoot({
      // envFilePath: ['.env.test', '.env'],
      ignoreEnvFile: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number().default(appConfig.getPort()),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development')
      })
    }),
    UserModule,
    AuthModule,
    ThrottlerModule.forRoot({
      ttl: 30, // retry after 30 seconds
      limit: 10 // limit to 10 requests per 30 seconds
    })

    // AutomapperModule.forRoot({
    //   options: [{
    //     name: 'classMapper',
    //     pluginInitializer: classes
    //     // namingConventions: new CamelCaseNamingConvention()
    //   }],
    //   singular: true
    // })
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
        // { path: '/api/v1.0/health', method: RequestMethod.GET }
        appConfig.showHealthLogs() ? '' : `/${appConfig.getGlobalPrefix()}/v${appConfig.getApiVersion()}/health`
      )
      .forRoutes('*')
  }
}
