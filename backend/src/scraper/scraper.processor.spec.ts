import { Test, TestingModule } from '@nestjs/testing'
import { BullModule, getQueueToken } from '@nestjs/bull'
import { getRedisToken } from '@liaoliaots/nestjs-redis'
import { Redis } from 'ioredis'
import * as puppeteer from 'puppeteer'
import cheerio from 'cheerio'

import { appConfig } from '../app.config'
import { QUEUE_NAME } from '../constants/job-queue'
import { KeywordService } from '../keyword/keyword.service'
import { ScraperProcessor } from './scraper.processor'

const REDIS_NAMESPACE = 'default'
const REDIS_CONCURRENT_REQUESTS_COUNT_KEY = 'concurrent-requests-count'

describe('ScraperProcessor', () => {
  let processor: ScraperProcessor
  let keywordService: KeywordService
  let redis: Redis

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: QUEUE_NAME
        })
      ],
      providers: [
        ScraperProcessor,
        {
          provide: KeywordService,
          useValue: {
            createMany: jest.fn(),
            update: jest.fn()
          }
        },
        {
          provide: getRedisToken(REDIS_NAMESPACE),
          useValue: {
            ping: jest.fn(),
            get: jest.fn(),
            set: jest.fn()
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

    processor = module.get<ScraperProcessor>(ScraperProcessor)
    keywordService = module.get<KeywordService>(KeywordService)
    redis = module.get<Redis>(getRedisToken(REDIS_NAMESPACE))
  })

  afterEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(processor).toBeDefined()
    expect(processor.handleTranscode).toBeDefined()
  })

  describe('getHtmlPuppeteer', () => {
    it('should be defined #POSITIVE', () => {
      expect(processor.getHtmlPuppeteer).toBeDefined()
    })
    it('should implemented correctly #POSITIVE', async () => {
      const spyGoTo = jest.fn()
      const spyClose = jest.fn()
      const spyContent = jest.fn().mockImplementation(() => Promise.resolve('<html></html>'))
      const spyNewPage = jest.fn().mockImplementation(() => ({
        content: spyContent,
        goto: spyGoTo
      }))
      jest.spyOn(puppeteer, 'launch').mockImplementation(() => ({
        newPage: spyNewPage,
        close: spyClose
      }) as never)

      const result = await processor.getHtmlPuppeteer('random-url')

      expect(puppeteer.launch).toHaveBeenCalled()
      expect(spyNewPage).toHaveBeenCalled()
      expect(spyGoTo).toHaveBeenCalledWith('random-url')
      expect(spyContent).toHaveBeenCalled()
      expect(spyClose).toHaveBeenCalled()
      expect(result).toEqual('<html></html>')
    })
  })

  describe('handleTranscode', () => {
    it('should be defined #POSITIVE', () => {
      expect(processor.handleTranscode).toBeDefined()
    })
    it('should implemented correctly #POSITIVE', async () => {
      const keyword = 'random-keyword'
      const rawHtml = '<html>raw</html>'

      const spyDoneCallback = jest.fn()
      const mockCheerio: any & { html?: any } = jest.fn()
      const mockCheerioText = jest.fn().mockReturnValueOnce('About No result at all')
      const mockCheerioHtml = jest.fn().mockReturnValueOnce('<html>All the html code</html>')
      mockCheerio.mockReturnValueOnce([1, 2, 3])
      mockCheerio.mockReturnValueOnce([1, 2, 3, 5, 45, 3, 1])
      mockCheerio.mockImplementationOnce(() => ({ text: mockCheerioText }))
      mockCheerio.html = mockCheerioHtml

      jest.spyOn(appConfig, 'getScrapeConfig').mockImplementation(() => ({
        SCRAPE_REQUESTS_THRESHOLD: 5,
        SCRAPE_THROTTLE_TIME: 3000,
        getRandomProxy: jest.fn()
      }))
      jest.spyOn(redis, 'ping')
      jest.spyOn(redis, 'get').mockResolvedValue('NaN')
      jest.spyOn(redis, 'set').mockResolvedValue(undefined)
      jest.spyOn(processor, 'getHtmlPuppeteer').mockResolvedValue(rawHtml)
      jest.spyOn(cheerio, 'load').mockImplementation(() => mockCheerio as never)
      jest.spyOn(keywordService, 'update').mockResolvedValue(undefined)

      await processor.handleTranscode({ id: 'job-id', data: { keyword, keywordId: 'k-id-1' } } as never, spyDoneCallback)

      expect(redis.ping).toHaveBeenCalled()
      expect(redis.get).toHaveBeenCalledWith(REDIS_CONCURRENT_REQUESTS_COUNT_KEY)
      expect(redis.set).toHaveBeenCalledWith(REDIS_CONCURRENT_REQUESTS_COUNT_KEY, 1)
      expect(processor.getHtmlPuppeteer).toHaveBeenCalledWith(`https://www.google.com/search?q=${keyword}`)
      expect(cheerio.load).toHaveBeenCalledWith(rawHtml)
      expect(mockCheerioText).toHaveBeenCalled()
      expect(mockCheerioHtml).toHaveBeenCalled()
      expect(keywordService.update).toHaveBeenCalled()
      expect(spyDoneCallback).toHaveBeenCalled()
    })
    it('should reset concurrent requests count value in Redis at throttling #POSITIVE', async () => {
      const keyword = 'random-keyword'
      const rawHtml = '<html>raw</html>'

      const spyDoneCallback = jest.fn()
      const mockCheerio: any & { html?: any } = jest.fn()
      const mockCheerioText = jest.fn().mockReturnValueOnce('About No result at all')
      const mockCheerioHtml = jest.fn().mockReturnValueOnce('<html>All the html code</html>')
      mockCheerio.mockReturnValueOnce([1, 2, 3])
      mockCheerio.mockReturnValueOnce([1, 2, 3, 5, 45, 3, 1])
      mockCheerio.mockImplementationOnce(() => ({ text: mockCheerioText }))
      mockCheerio.html = mockCheerioHtml

      jest.spyOn(appConfig, 'getScrapeConfig').mockImplementation(() => ({
        SCRAPE_REQUESTS_THRESHOLD: 5,
        SCRAPE_THROTTLE_TIME: 3000,
        getRandomProxy: jest.fn()
      }))
      jest.spyOn(redis, 'ping')
      jest.spyOn(redis, 'get').mockResolvedValue(5 as never)
      jest.spyOn(redis, 'set').mockResolvedValue(undefined)
      jest.spyOn(processor, 'getHtmlPuppeteer').mockResolvedValue(rawHtml)
      jest.spyOn(cheerio, 'load').mockImplementation(() => mockCheerio as never)
      jest.spyOn(keywordService, 'update').mockResolvedValue(undefined)

      await processor.handleTranscode({ id: 'job-id', data: { keyword, keywordId: 'k-id-1' } } as never, spyDoneCallback)

      expect(redis.ping).toHaveBeenCalled()
      expect(redis.get).toHaveBeenCalledWith(REDIS_CONCURRENT_REQUESTS_COUNT_KEY)
      expect(redis.set).toHaveBeenCalledWith(REDIS_CONCURRENT_REQUESTS_COUNT_KEY, 0)
      expect(processor.getHtmlPuppeteer).toHaveBeenCalledWith(`https://www.google.com/search?q=${keyword}`)
      expect(cheerio.load).toHaveBeenCalledWith(rawHtml)
      expect(mockCheerioText).toHaveBeenCalled()
      expect(mockCheerioHtml).toHaveBeenCalled()
      expect(keywordService.update).toHaveBeenCalled()
      expect(spyDoneCallback).toHaveBeenCalled()
    })
    it('should do nothing if Redis was not healthy #NEGATIVE', async () => {
      const keyword = 'random-keyword'
      const rawHtml = '<html>raw</html>'

      const spyDoneCallback = jest.fn()
      jest.spyOn(redis, 'ping').mockRejectedValueOnce(new Error('Redis ping error'))
      jest.spyOn(processor, 'getHtmlPuppeteer').mockResolvedValue(rawHtml)

      await processor.handleTranscode({ id: 'job-id', data: { keyword, keywordId: 'k-id-1' } } as never, spyDoneCallback)

      expect(redis.ping).toHaveBeenCalled()
      expect(redis.get).not.toHaveBeenCalled()
      expect(redis.set).not.toHaveBeenCalled()
      expect(processor.getHtmlPuppeteer).not.toHaveBeenCalled()
      expect(keywordService.update).not.toHaveBeenCalled()
      expect(spyDoneCallback).not.toHaveBeenCalled()
    })
  })
})
