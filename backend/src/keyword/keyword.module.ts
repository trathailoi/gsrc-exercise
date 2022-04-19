import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bull'

import { Mapper } from '../common/mapper'
import { QUEUE_NAME } from '../constants/job-queue'

import { KeywordService } from './keyword.service'
import { KeywordController } from './keyword.controller'
import { Keyword } from './keyword.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Keyword]),
    BullModule.registerQueue({
      name: QUEUE_NAME
    })
  ],
  controllers: [KeywordController],
  providers: [
    KeywordService,
    Mapper
  ],
  exports: [KeywordService]
})
export class KeywordModule {}
