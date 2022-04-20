import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'

import { QUEUE_NAME } from '../constants/job-queue'
import { ScraperController } from './scraper.controller'
import { ScraperProcessor } from './scraper.processor'

import { KeywordModule } from '../keyword/keyword.module'

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAME
    }),
    KeywordModule
  ],
  providers: [ScraperProcessor],
  exports: [],
  controllers: [ScraperController]
})
export class ScraperModule {}
