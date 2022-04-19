import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BullModule, getQueueToken } from '@nestjs/bull'

import { QUEUE_NAME } from '../constants/job-queue'
import { Mapper } from '../common/mapper'
import { Keyword } from './keyword.entity'
import { KeywordService } from './keyword.service'

const MOVIE_REPOSITORY_TOKEN = getRepositoryToken(Keyword)

const exampleQueueMock = { add: jest.fn() }

describe('KeywordService', () => {
  let service: KeywordService
  let keywordRepository: Repository<Keyword>

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
            findOne: jest.fn()
          }
        }
      ]
    })
      .overrideProvider(getQueueToken(QUEUE_NAME))
      .useValue(exampleQueueMock)
      .compile()

    service = module.get<KeywordService>(KeywordService)
    keywordRepository = module.get<Repository<Keyword>>(MOVIE_REPOSITORY_TOKEN)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should define keywordRepository', () => {
    expect(keywordRepository).toBeDefined()
  })

  describe('findOne', () => {
    it('shoud be working', async () => {
      jest.spyOn(keywordRepository, 'findOne').mockResolvedValueOnce(undefined)
      await service.findOne('123')
      expect(keywordRepository.findOne).toBeCalled()
    })
  })
})
