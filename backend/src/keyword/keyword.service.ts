import { Injectable, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Repository, In, ObjectLiteral
} from 'typeorm'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'
import type { EntityId } from 'typeorm/repository/EntityId'

import { QUEUE_NAME, QUEUE_JOB_PREFIX, JOB_NAME } from '../constants/job-queue'
import { standardizeQueuedJobId } from '../common/utils'
import { Mapper } from '../common/mapper'
import { BaseService } from '../common/base.service'
import { Keyword } from './keyword.entity'
import { KeywordResultDto } from './dto/keyword.result.dto'

import { User } from '../user/user.entity'

@Injectable()
export class KeywordService extends BaseService<Keyword> {
  async scanRedisKeys(cursor: string, pattern: string, returnArr: string[]) {
    const [cur, arr] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 1000)
    // eslint-disable-next-line no-param-reassign
    cursor = cur
    // eslint-disable-next-line no-param-reassign
    returnArr = [...returnArr, ...(arr.filter((key) => !returnArr.includes(key)))]
    return (cursor === '0') ? returnArr : this.scanRedisKeys(cursor, pattern, returnArr)
  }

  constructor(
    @InjectRepository(Keyword) private readonly repo: Repository<Keyword>,
    @InjectQueue(QUEUE_NAME) private readonly scrapeQueue: Queue,
    @InjectRedis() private readonly redis: Redis,
    private readonly mapper: Mapper
  ) {
    super(repo)
  }

  async create(entity: KeywordResultDto, createdBy: User): Promise<ObjectLiteral> {
    const tmpEntity = entity
    tmpEntity.name = String(entity.name).trim()
    const foundKeyword = await this.repo.findOne({ name: tmpEntity.name, createdBy })
    if (foundKeyword) {
      throw new ConflictException('Keyword already exists')
    }
    const { identifiers } = await this.repo.insert(
      this.mapper.map(
        KeywordResultDto,
        Keyword,
        {
          ...tmpEntity,
          createdBy
        }
      )
    )
    return identifiers[0]
  }

  async createMany(entities: KeywordResultDto[], createdBy: User): Promise<ObjectLiteral[]> {
    const uniqueKeywords = [...new Set(entities.map((entity) => String(entity.name).trim()))]
    const foundKeywords = await this.repo.find({ name: In(uniqueKeywords), createdBy })
    const foundKeywordsStrings = foundKeywords.map((foundKeyword) => foundKeyword.name)
    const validKeywordDTOs = uniqueKeywords.reduce((vKs, keyword) => [
      ...vKs,
      ...(foundKeywordsStrings.includes(keyword) ? [] : [
        this.mapper.map(
          KeywordResultDto,
          Keyword,
          {
            name: keyword,
            createdBy
          }
        )
      ])
    ], [])
    if (validKeywordDTOs.length) {
      const result = await this.repo.insert(validKeywordDTOs)
      return result.identifiers
    }
    return []
  }

  async findOne(id: EntityId): Promise<Keyword & { queuedJobId?: string } | undefined> {
    let latestJob = null
    const jobKeys = await this.scanRedisKeys('0', `${QUEUE_JOB_PREFIX}:${id}-*`, [])
    if (jobKeys.length) {
      const latestJobKey = jobKeys.sort().pop()
      latestJob = await this.scrapeQueue.getJob(latestJobKey.replace(`${QUEUE_JOB_PREFIX}:`, ''))
    }
    const keyword = await this.repo.findOne(id, { relations: ['createdBy', 'modifiedBy'] })
    // keyword.rawHtml = ''
    return Object.assign(keyword, (latestJob && { queuedJobId: String(latestJob.id) }) || {})
  }

  async updateKeyword(id: EntityId, entity: KeywordResultDto, modifiedBy: User): Promise<ObjectLiteral> {
    const tmpEntity = entity
    tmpEntity.name = String(entity.name).trim()
    const foundKeyword = await this.repo.findOne({ name: tmpEntity.name, createdBy: modifiedBy })
    if (foundKeyword && (foundKeyword.id !== id)) {
      throw new ConflictException('Keyword already exists')
    } else {
      tmpEntity.isFinishedScraping = false
      tmpEntity.modifiedBy = modifiedBy
      const updateResult = await this.update(id, tmpEntity)
      // trigger a new job
      this.scrapeQueue.add(
        JOB_NAME,
        {
          keywordId: id,
          keyword: tmpEntity.name
        },
        {
          jobId: standardizeQueuedJobId(String(id))
        }
      )
      return updateResult
    }
  }

  update(id: EntityId, entity: KeywordResultDto): Promise<ObjectLiteral> {
    return this.repo.update(id, this.mapper.map(KeywordResultDto, Keyword, entity))
  }
}
