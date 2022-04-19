import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'

import { ScraperController } from './scraper.controller'
import { ScraperProcessor } from './scraper.processor'

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scraper'
    })
  ],
  providers: [ScraperProcessor],
  exports: [],
  controllers: [ScraperController]
})
export class ScraperModule {}
