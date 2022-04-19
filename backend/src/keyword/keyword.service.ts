import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, InsertResult, UpdateResult } from 'typeorm'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import type { EntityId } from 'typeorm/repository/EntityId'

import { QUEUE_NAME, JOB_NAME } from '../constants/job-queue'
import { Mapper } from '../common/mapper'
import { BaseService } from '../common/base.service'
import { Keyword } from './keyword.entity'
import { KeywordResultDto } from './dto/keyword.result.dto'

import { User } from '../user/user.entity'

@Injectable()
export class KeywordService extends BaseService<Keyword> {
  constructor(
    @InjectRepository(Keyword) private readonly repo: Repository<Keyword>,
    @InjectQueue(QUEUE_NAME) private readonly scrapeQueue: Queue,
    private readonly mapper: Mapper
  ) {
    super(repo)
  }

  async create(entity: KeywordResultDto, createdBy: User): Promise<InsertResult> {
    const jobData = await this.scrapeQueue.add(JOB_NAME, { keyword: entity.name })
    return this.repository.insert(
      this.mapper.map(
        KeywordResultDto,
        Keyword,
        {
          ...entity,
          jobQueueId: jobData.id, // NOTE: possibly be `${}${jobId}`
          createdBy
        }
      )
    )
  }

  findOne(id: EntityId): Promise<Keyword | undefined> {
    return this.repo.findOne(id, { relations: ['createdBy', 'modifiedBy'] })
  }

  findOneByJob(jobQueueId: string): Promise<Keyword | undefined> {
    return this.repo.findOne({ jobQueueId })
  }

  async updateKeyword(id: EntityId, entity: KeywordResultDto, modifiedBy: User): Promise<UpdateResult> {
    const jobData = await this.scrapeQueue.add(JOB_NAME, { keyword: entity.name })
    const tmpEntity = entity
    tmpEntity.jobQueueId = String(jobData.id)
    tmpEntity.isFinishedScraping = false
    tmpEntity.modifiedBy = modifiedBy
    return this.update(id, tmpEntity)
  }

  update(id: EntityId, entity: KeywordResultDto): Promise<UpdateResult> {
    return this.repo.update(id, this.mapper.map(KeywordResultDto, Keyword, entity))
  }
}
