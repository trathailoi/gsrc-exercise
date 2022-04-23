import { Test, TestingModule } from '@nestjs/testing'
import { BullModule, getQueueToken } from '@nestjs/bull'
import { Queue } from 'bull'
import { getMockRes } from '@jest-mock/express'

import { QUEUE_NAME } from '../constants/job-queue'
import { ScraperController } from './scraper.controller'
import { KeywordService } from '../keyword/keyword.service'
import { User } from '../user/user.entity'
import * as utils from '../common/utils'

const { res } = getMockRes()

describe('ScraperController', () => {
  let scraperController: ScraperController
  let keywordService: KeywordService
  let queue: Queue

  beforeEach(async () => {
    const scraper: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: QUEUE_NAME
        })
      ],
      providers: [
        {
          provide: KeywordService,
          useValue: {
            createMany: jest.fn()
          }
        }
      ],
      controllers: [ScraperController]
    })
      .overrideProvider(getQueueToken(QUEUE_NAME))
      .useValue({
        add: jest.fn(),
        getJob: jest.fn()
      })
      .compile()

    scraperController = scraper.get<ScraperController>(ScraperController)
    keywordService = scraper.get<KeywordService>(KeywordService)
    queue = scraper.get<Queue>(getQueueToken(QUEUE_NAME))
  })

  afterEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(scraperController).toBeDefined()
  })

  describe('processFile', () => {
    it('should process with UNDER 100 keywords #POSITIVE', async () => {
      const sampleFormData = {
        file: {
          filename: 'test.csv',
          mimetype: 'csv',
          path: 'sample-url',
          buffer: Buffer.from('whatever')
        },
        user: new User()
      }
      const sampleCsvData = ['keyword1', 'keyword2']
      jest.spyOn(keywordService, 'createMany').mockResolvedValueOnce([])
      jest.spyOn(utils, 'readCsvAsync').mockResolvedValueOnce(sampleCsvData)
      const result = await scraperController.processFile(sampleFormData.file as Express.Multer.File, sampleFormData.user)

      expect(utils.readCsvAsync).toHaveBeenCalledWith(sampleFormData.file.buffer)
      expect(keywordService.createMany).toHaveBeenCalled()
      expect(result).toStrictEqual([])
    })

    it('should throw exception with GREATER THAN 100 keywords #NEGATIVE', async () => {
      const sampleFormData = {
        file: {
          filename: 'test.csv',
          mimetype: 'csv',
          path: 'sample-url',
          buffer: Buffer.from('whatever')
        },
        user: new User()
      }
      const sampleCsvData = Array.from({ length: 101 }, (v, i) => `keyword-${i}`)
      jest.spyOn(keywordService, 'createMany').mockResolvedValueOnce([])
      jest.spyOn(utils, 'readCsvAsync').mockResolvedValueOnce(sampleCsvData)

      expect(scraperController.processFile(sampleFormData.file as Express.Multer.File, sampleFormData.user)).rejects.toThrow()

      expect(utils.readCsvAsync).toBeCalledWith(sampleFormData.file.buffer)
      expect(keywordService.createMany).not.toBeCalled()
    })
  })

  describe('getJobResult', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      const sampleKeywordId = 'job-id'
      jest.spyOn(queue, 'getJob').mockResolvedValueOnce({
        id: sampleKeywordId,
        isCompleted: () => true,
        returnvalue: {
          rawHtml: 'sample-html',
          resultStats: 'sample-result-stats'
        }
      } as never)

      await scraperController.getJobResult(res, sampleKeywordId)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          resultStats: 'sample-result-stats'
        })
      )
    })

    it('should return 404 with non existing job id #NEGATIVE', async () => {
      const sampleKeywordId = 'not-found-job-id'
      jest.spyOn(queue, 'getJob').mockResolvedValueOnce(null)

      await scraperController.getJobResult(res, sampleKeywordId)

      expect(res.sendStatus).toHaveBeenCalledWith(404)
    })

    it('should return 202 with incomplete job id #NEGATIVE', async () => {
      const sampleKeywordId = 'incomplete-job-id'
      jest.spyOn(queue, 'getJob').mockResolvedValueOnce({
        id: sampleKeywordId,
        isCompleted: () => false
      } as never)

      await scraperController.getJobResult(res, sampleKeywordId)

      expect(res.sendStatus).toHaveBeenCalledWith(202)
    })
  })
})
