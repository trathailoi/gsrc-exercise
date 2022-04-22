import type {
  EntitySubscriberInterface,
  InsertEvent
} from 'typeorm'
import { Connection, EventSubscriber } from 'typeorm'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

import { QUEUE_NAME, JOB_NAME } from '../constants/job-queue'
import { standardizeQueuedJobId } from '../common/utils'

import { Keyword } from './keyword.entity'

@EventSubscriber()
export class KeywordSubscriber implements EntitySubscriberInterface<Keyword> {
  constructor(
    connection: Connection,
    @InjectQueue(QUEUE_NAME) private readonly scrapeQueue: Queue
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): typeof Keyword {
    return Keyword
  }

  async afterInsert(event: InsertEvent<Keyword>) {
    this.scrapeQueue.add(
      JOB_NAME,
      {
        keywordId: event.entity.id,
        keyword: event.entity.name
      },
      {
        jobId: standardizeQueuedJobId(event.entity.id)
      }
    )
  }
}
