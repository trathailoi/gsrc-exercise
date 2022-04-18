import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { appConfig } from './app.config'
import { FmLogger } from './logger/logger.service'

async function bootstrap() {
  const logger = new FmLogger('Bootstrap')

  const app = await NestFactory.create(AppModule, { logger: appConfig.isVerbose() ? logger : false })
  app.setGlobalPrefix(appConfig.getGlobalPrefix()) // http://localhost:3000/api/...
  app.enableVersioning({ // http://localhost:3000/api/v1.0/...
    type: VersioningType.URI,
    defaultVersion: appConfig.getApiVersion()
  })

  logger.debug(`isProduction: ${appConfig.isProduction()} --- isDebug: ${appConfig.isDebug()} --- isVerbose: ${appConfig.isVerbose()}`)
  if (!appConfig.isProduction()) {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder()
      .setTitle('Google Search Results Scraper (GSRS) APIs')
      .setDescription('Google Search Results Scraper (GSRS) APIs\' documentation')
      .setVersion(appConfig.getApiVersion())
      .addBearerAuth()
      .build())
    SwaggerModule.setup('api', app, document) // NOTE: access the Swagger documentation at "/api"
  }

  app.enableCors({
    origin: appConfig.getClientUrl(),
    credentials: true
  })
  app.use(cookieParser())
  logger.debug(`appConfig.getPort(): ${appConfig.getPort()}`)
  await app.listen(appConfig.getPort())
}
bootstrap()
