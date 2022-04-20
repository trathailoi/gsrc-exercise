import type {
  EntitySubscriberInterface,
  InsertEvent
  // UpdateEvent
} from 'typeorm'
import { EventSubscriber } from 'typeorm'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

import { QUEUE_NAME, JOB_NAME } from '../constants/job-queue'

import { Keyword } from './keyword.entity'

@EventSubscriber()
export class KeywordSubscriber implements EntitySubscriberInterface<Keyword> {
  constructor(
    @InjectQueue(QUEUE_NAME) private readonly scrapeQueue: Queue
  ) {}

  listenTo(): typeof Keyword {
    return Keyword
  }

  async beforeInsert(event: InsertEvent<Keyword>) {
    if (!event.entity.jobQueueId) {
      console.log('this.scrapeQueue', this.scrapeQueue)
      const jobData = await this.scrapeQueue.add(JOB_NAME, { keyword: event.entity.name })
      // eslint-disable-next-line no-param-reassign
      event.entity.jobQueueId = String(jobData.id) // NOTE: possibly be `${jobData.name}:${jobId}`
    }
  }

  // beforeUpdate(event: UpdateEvent<Keyword>): void {
  //   // FIXME check event.databaseEntity.password
  //   const entity = event.entity as Keyword

  //   if (entity.password !== event.databaseEntity.password) {
  //     entity.password = generateHash(entity.password!)
  //   }
  // }
}
