import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { BullModule, getQueueToken } from '@nestjs/bull'
import { Queue } from 'bull'

import { User } from '../user/user.entity'
import { QUEUE_NAME, JOB_NAME } from '../constants/job-queue'
import { Mapper } from '../common/mapper'
import { Keyword } from './keyword.entity'
import { KeywordService } from './keyword.service'

const MOVIE_REPOSITORY_TOKEN = getRepositoryToken(Keyword)

const exampleQueueMock = { add: jest.fn() }

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
          provide: MOVIE_REPOSITORY_TOKEN,
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            insert: jest.fn(),
            update: jest.fn()
          }
        }
      ]
    })
      .overrideProvider(getQueueToken(QUEUE_NAME))
      .useValue(exampleQueueMock)
      .compile()

    service = module.get<KeywordService>(KeywordService)
    keywordRepository = module.get<Repository<Keyword>>(MOVIE_REPOSITORY_TOKEN)
    queue = module.get<Queue>(getQueueToken(QUEUE_NAME))
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

  describe('create', () => {
    it('shoud be correctly implemented #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce(undefined)
      jest.spyOn(keywordRepository, 'insert').mockResolvedValueOnce({ identifiers: [{ id: sampleData.keywordId }] } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id } as never)

      const result = await service.create({ name: sampleData.keyword }, sampleData.user)

      expect(keywordRepository.findOne).toBeCalledWith({ name: sampleData.keyword, createdBy: sampleData.user })
      expect(queue.add).toBeCalledWith(JOB_NAME, { keyword: sampleData.keyword })
      expect(keywordRepository.insert).toBeCalledWith({ name: sampleData.keyword, jobQueueId: sampleData.jobData.id, createdBy: sampleData.user })
      expect(result).toHaveProperty('id')
    })

    it('shoud throw exception on creating duplicated keyword #NEGATIVE', async () => {
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce({ id: sampleData.keywordId, name: sampleData.keyword } as never)
      jest.spyOn(keywordRepository, 'insert').mockResolvedValueOnce({ identifiers: [{ id: sampleData.keywordId }] } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id } as never)

      expect(service.create({ name: sampleData.keyword }, sampleData.user)).rejects.toThrow()

      expect(keywordRepository.findOne).toBeCalledWith({ name: sampleData.keyword, createdBy: sampleData.user })
      expect(queue.add).not.toHaveBeenCalled()
      expect(keywordRepository.insert).not.toHaveBeenCalled()
    })
  })

  describe('createMany', () => {
    it('shoud add all the imported keywords #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'find').mockResolvedValueOnce([] as never)
      jest.spyOn(keywordRepository, 'insert').mockResolvedValueOnce({ identifiers: [{ id: sampleData.keywordId }] } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[0] } } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[1] } } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[2] } } as never)

      const result = await service.createMany(sampleData.keywords.map((k) => ({ name: k })), sampleData.user)

      expect(keywordRepository.find).toBeCalledWith({ name: In(sampleData.keywords), createdBy: sampleData.user })
      expect(queue.add).toHaveBeenNthCalledWith(1, JOB_NAME, { keyword: sampleData.keywords[0] })
      expect(queue.add).toHaveBeenNthCalledWith(2, JOB_NAME, { keyword: sampleData.keywords[1] })
      expect(queue.add).toHaveBeenNthCalledWith(3, JOB_NAME, { keyword: sampleData.keywords[2] })
      expect(keywordRepository.insert).toBeCalled()
      expect(result).toStrictEqual(expect.arrayContaining([{ id: sampleData.keywordId }]))
    })

    it('shoud skip A FEW existing keywords #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'find').mockResolvedValueOnce([{ id: sampleData.keywordId, name: sampleData.keyword }] as never)
      jest.spyOn(keywordRepository, 'insert').mockResolvedValueOnce({ identifiers: [{ id: sampleData.keywordId }] } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[1] } } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[2] } } as never)

      const result = await service.createMany(sampleData.keywords.map((k) => ({ name: k })), sampleData.user)

      expect(keywordRepository.find).toBeCalledWith({ name: In(sampleData.keywords), createdBy: sampleData.user })
      expect(queue.add).toHaveBeenNthCalledWith(1, JOB_NAME, { keyword: sampleData.keywords[1] })
      expect(queue.add).toHaveBeenNthCalledWith(2, JOB_NAME, { keyword: sampleData.keywords[2] })
      expect(keywordRepository.insert).toBeCalled()
      expect(result).toStrictEqual(expect.arrayContaining([{ id: sampleData.keywordId }]))
    })

    it('shoud skip ALL existing keywords #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'find').mockResolvedValueOnce(sampleData.keywords.map((k) => ({ id: sampleData.keywordId, name: k })) as never)
      jest.spyOn(keywordRepository, 'insert').mockResolvedValueOnce({ identifiers: [{ id: sampleData.keywordId }] } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[0] } } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[1] } } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[2] } } as never)

      const result = await service.createMany(sampleData.keywords.map((k) => ({ name: k })), sampleData.user)

      expect(keywordRepository.find).toBeCalledWith({ name: In(sampleData.keywords), createdBy: sampleData.user })
      expect(queue.add).not.toHaveBeenCalled()
      expect(keywordRepository.insert).not.toHaveBeenCalled()
      expect(result).toStrictEqual([])
    })
  })

  describe('findOne', () => {
    it('shoud be correctly implemented #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce(undefined)
      await service.findOne(sampleData.keywordId)
      expect(keywordRepository.findOne).toBeCalledWith(sampleData.keywordId, { relations: ['createdBy', 'modifiedBy'] })
    })
  })

  describe('findOneByJob', () => {
    it('shoud be correctly implemented #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce(undefined)
      await service.findOneByJob(sampleData.keywordId)
      expect(keywordRepository.findOne).toBeCalledWith({ jobQueueId: sampleData.keywordId })
    })
  })

  describe('updateKeyword', () => {
    it('shoud be correctly implemented #POSITIVE', async () => {
      const mockUpdateResult = { id: sampleData.keywordId }
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce(undefined)
      jest.spyOn(keywordRepository, 'update').mockResolvedValueOnce(mockUpdateResult as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[0] } } as never)

      const result = await service.updateKeyword(sampleData.keywordId, { name: sampleData.keyword }, sampleData.user)

      expect(keywordRepository.findOne).toBeCalledWith({ name: sampleData.keyword, createdBy: sampleData.user })
      expect(queue.add).toHaveBeenCalledWith(JOB_NAME, { keyword: sampleData.keyword })
      expect(result).toStrictEqual(mockUpdateResult)
    })

    it('shoud be throw exception to avoid duplicated keywords #NEGATIVE', async () => {
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce({ id: 'zxczxc', name: sampleData.keyword } as never)
      jest.spyOn(queue, 'add').mockResolvedValueOnce({ id: sampleData.jobData.id, data: { keyword: sampleData.keywords[0] } } as never)

      expect(service.updateKeyword(sampleData.keywordId, { name: sampleData.keyword }, sampleData.user)).rejects.toThrow()

      expect(keywordRepository.findOne).toBeCalledWith({ name: sampleData.keyword, createdBy: sampleData.user })
      expect(queue.add).not.toHaveBeenCalledWith(JOB_NAME, { keyword: sampleData.keyword })
    })
  })

  describe('update', () => {
    it('shoud be correctly implemented #POSITIVE', async () => {
      jest.spyOn(keywordRepository, 'update').mockResolvedValueOnce(undefined)
      await service.update(sampleData.keywordId, { name: sampleData.keyword })
      expect(keywordRepository.update).toHaveBeenCalled()
    })
  })
})
