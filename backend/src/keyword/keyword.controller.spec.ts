import { Test, TestingModule } from '@nestjs/testing'

import { KeywordController } from './keyword.controller'
import { KeywordService } from './keyword.service'
import { Mapper } from '../common/mapper'

describe('KeywordController', () => {
  let keywordController: KeywordController
  // let keywordService: KeywordService

  beforeEach(async () => {
    const keyword: TestingModule = await Test.createTestingModule({
      controllers: [KeywordController],
      providers: [
        Mapper,
        {
          provide: KeywordService,
          useValue: {
            // from src/common/base.service.ts
            create: jest.fn(),
            update: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByIds: jest.fn(),
            delete: jest.fn()
          }
        }
      ]
    }).compile()

    keywordController = keyword.get<KeywordController>(KeywordController)
    // keywordService = keyword.get<KeywordService>(KeywordService)
  })

  it('should be defined', () => {
    expect(keywordController).toBeDefined()
  })
})
