import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { BullModule, getQueueToken } from '@nestjs/bull'
import { Queue } from 'bull'
import { getRedisToken } from '@liaoliaots/nestjs-redis'
import { Redis } from 'ioredis'

import { User } from '../user/user.entity'
import { QUEUE_NAME, JOB_NAME } from '../constants/job-queue'
import { Mapper } from '../common/mapper'
import { Keyword } from './keyword.entity'
import { KeywordService } from './keyword.service'

const KEYWORD_REPOSITORY_TOKEN = getRepositoryToken(Keyword)
const REDIS_NAMESPACE = 'default'

const sampleData = {
  keyword: 'fastfood',
  keywords: ['fastfood', 'shirts', 'shoes'],
  user: new User(),

  keywordId: '123',
  jobData: {
    id: '1'
  }
}

describe('KeywordService', () => {
  let service: KeywordService
  let keywordRepository: Repository<Keyword>
  let queue: Queue
  let redis: Redis

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: QUEUE_NAME
        })
      ],
      providers: [
        Mapper,
        KeywordService,
        {
          provide: KEYWORD_REPOSITORY_TOKEN,
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            insert: jest.fn(),
            update: jest.fn()
          }
        },
        {
          provide: getRedisToken(REDIS_NAMESPACE),
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            scan: jest.fn()
          }
        }
      ]
    })
      .overrideProvider(getQueueToken(QUEUE_NAME))
      .useValue({
        add: jest.fn(),
        getJob: jest.fn()
      })
      .compile()

    service = module.get<KeywordService>(KeywordService)
    keywordRepository = module.get<Repository<Keyword>>(KEYWORD_REPOSITORY_TOKEN)
    queue = module.get<Queue>(getQueueToken(QUEUE_NAME))
    redis = module.get<Redis>(getRedisToken(REDIS_NAMESPACE))
  })

  afterEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should define keywordRepository', () => {
    expect(keywordRepository).toBeDefined()
  })

  describe('scanRedisKeys', () => {
    it('should return empty array if no keys found #NEGATIVE', async () => {
      jest.spyOn(redis, 'scan').mockResolvedValue(['0', []])
      const result = await service.scanRedisKeys('0', 'random-pattern', [])
      expect(result).toEqual([])
    })
    it('should return found keys case #1 #POSITIVE', async () => {
      jest.spyOn(redis, 'scan').mockResolvedValue(['0', ['random-pattern']])
      const result = await service.scanRedisKeys('0', 'random-pattern', [])
      expect(result).toContain('random-pattern')
    })
    it('should return found keys case #2 #POSITIVE', async () => {
      jest.spyOn(redis, 'scan')
        .mockResolvedValueOnce(['167', []])
        .mockResolvedValueOnce(['0', ['random-pattern']])
      const result = await service.scanRedisKeys('0', 'random-pattern', [])
      expect(result).toContain('random-pattern')
    })
  })

  describe('create', () => {
    it('should be correctly implemented #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce(undefined)
      jest.spyOn(keywordRepository, 'insert').mockResolvedValueOnce({ identifiers: [{ id: sampleData.keywordId }] } as never)

      const result = await service.create({ name: sampleData.keyword }, sampleData.user)

      expect(keywordRepository.findOne).toBeCalledWith({ name: sampleData.keyword, createdBy: sampleData.user })
      expect(keywordRepository.insert).toBeCalledWith({ name: sampleData.keyword, createdBy: sampleData.user })
      expect(result).toHaveProperty('id')
    })

    it('should throw exception on creating duplicated keyword #NEGATIVE', async () => {
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce({ id: sampleData.keywordId, name: sampleData.keyword } as never)
      jest.spyOn(keywordRepository, 'insert').mockResolvedValueOnce({ identifiers: [{ id: sampleData.keywordId }] } as never)

      expect(service.create({ name: sampleData.keyword }, sampleData.user)).rejects.toThrow()

      expect(keywordRepository.findOne).toBeCalledWith({ name: sampleData.keyword, createdBy: sampleData.user })
      expect(keywordRepository.insert).not.toHaveBeenCalled()
    })
  })

  describe('createMany', () => {
    it('should add all the imported keywords #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'find').mockResolvedValueOnce([] as never)
      jest.spyOn(keywordRepository, 'insert').mockResolvedValueOnce({ identifiers: [{ id: sampleData.keywordId }] } as never)

      const result = await service.createMany(sampleData.keywords.map((k) => ({ name: k })), sampleData.user)

      expect(keywordRepository.find).toBeCalledWith({ name: In(sampleData.keywords), createdBy: sampleData.user })
      expect(keywordRepository.insert).toBeCalled()
      expect(result).toStrictEqual(expect.arrayContaining([{ id: sampleData.keywordId }]))
    })

    it('should skip A FEW existing keywords #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'find').mockResolvedValueOnce([{ id: sampleData.keywordId, name: sampleData.keyword }] as never)
      jest.spyOn(keywordRepository, 'insert').mockResolvedValueOnce({ identifiers: [{ id: sampleData.keywordId }] } as never)

      const result = await service.createMany(sampleData.keywords.map((k) => ({ name: k })), sampleData.user)

      expect(keywordRepository.find).toBeCalledWith({ name: In(sampleData.keywords), createdBy: sampleData.user })
      expect(keywordRepository.insert).toBeCalled()
      expect(result).toStrictEqual(expect.arrayContaining([{ id: sampleData.keywordId }]))
    })

    it('should skip ALL existing keywords #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'find').mockResolvedValueOnce(sampleData.keywords.map((k) => ({ id: sampleData.keywordId, name: k })) as never)
      jest.spyOn(keywordRepository, 'insert').mockResolvedValueOnce({ identifiers: [{ id: sampleData.keywordId }] } as never)

      const result = await service.createMany(sampleData.keywords.map((k) => ({ name: k })), sampleData.user)

      expect(keywordRepository.find).toBeCalledWith({ name: In(sampleData.keywords), createdBy: sampleData.user })
      expect(keywordRepository.insert).not.toHaveBeenCalled()
      expect(result).toStrictEqual([])
    })
  })

  describe('findOne', () => {
    it('should return WITH queuedJobId #POSITIVE', async () => {
      const mockKeyWordResult = { id: sampleData.keywordId, name: sampleData.keyword, createdBy: sampleData.user }
      const sampleJobId = 'random-queued-job-id'
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce(mockKeyWordResult as never)
      jest.spyOn(service, 'scanRedisKeys').mockResolvedValueOnce([sampleJobId])
      jest.spyOn(queue, 'getJob').mockResolvedValueOnce({ id: sampleJobId } as never)

      const result = await service.findOne(sampleData.keywordId)

      expect(keywordRepository.findOne).toBeCalledWith(sampleData.keywordId, { relations: ['createdBy', 'modifiedBy'] })
      expect(queue.getJob).toBeCalled()
      expect(result).toStrictEqual({ ...mockKeyWordResult, queuedJobId: sampleJobId })
    })

    it('should return WITHOUT queuedJobId #POSITIVE', async () => {
      const mockKeyWordResult = { id: sampleData.keywordId, name: sampleData.keyword, createdBy: sampleData.user }
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce(mockKeyWordResult as never)
      jest.spyOn(service, 'scanRedisKeys').mockResolvedValueOnce([])
      jest.spyOn(queue, 'getJob').mockResolvedValueOnce(null)

      const result = await service.findOne(sampleData.keywordId)

      expect(keywordRepository.findOne).toBeCalledWith(sampleData.keywordId, { relations: ['createdBy', 'modifiedBy'] })
      expect(queue.getJob).not.toBeCalled()
      expect(result).not.toHaveProperty('queuedJobId')
      expect(result).toStrictEqual(mockKeyWordResult)
    })
  })

  describe('updateKeyword', () => {
    it('should be correctly implemented #POSITIVE', async () => {
      const mockUpdateResult = { id: sampleData.keywordId }
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce(undefined)
      jest.spyOn(keywordRepository, 'update').mockResolvedValueOnce(mockUpdateResult as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[0] } } as never)

      const result = await service.updateKeyword(sampleData.keywordId, { name: sampleData.keyword }, sampleData.user)

      expect(keywordRepository.findOne).toBeCalledWith({ name: sampleData.keyword, createdBy: sampleData.user })
      expect(queue.add).toHaveBeenCalledWith(
        JOB_NAME,
        {
          keywordId: sampleData.keywordId,
          keyword: sampleData.keyword
        },
        {
          jobId: expect.any(String)
        }
      )
      expect(result).toStrictEqual(mockUpdateResult)
    })

    it('should be throw exception to avoid duplicated keywords #NEGATIVE', async () => {
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce({ id: 'zxczxc', name: sampleData.keyword } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[0] } } as never)

      expect(service.updateKeyword(sampleData.keywordId, { name: sampleData.keyword }, sampleData.user)).rejects.toThrow()

      expect(keywordRepository.findOne).toBeCalledWith({ name: sampleData.keyword, createdBy: sampleData.user })
      expect(queue.add).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should be correctly implemented #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'update').mockResolvedValueOnce(undefined)
      await service.update(sampleData.keywordId, { name: sampleData.keyword })
      expect(keywordRepository.update).toHaveBeenCalled()
    })
  })
})
