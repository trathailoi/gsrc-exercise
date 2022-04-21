import * as puppeteer from 'puppeteer'
import { load as cheerioLoad } from 'cheerio'
import { Process, Processor } from '@nestjs/bull'
import { Job, DoneCallback } from 'bull'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'

import { appConfig } from '../app.config'
import { QUEUE_NAME, JOB_NAME } from '../constants/job-queue'
import { FmLogger } from '../logger/logger.service'

import { KeywordService } from '../keyword/keyword.service'

type ResultInfo = Record<string, unknown> | {
  adwordsCount: number,
  linksCount: number,
  resultStats: string,
  rawHtml: string
}

const {
  SCRAPE_REQUESTS_THRESHOLD,
  SCRAPE_THROTTLE_TIME,
  getRandomProxy
} = appConfig.getScrapeConfig()

const getHtmlPuppeteer = async (url: string) => {
  const proxy = getRandomProxy()
  console.log('proxy', proxy)
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      // '--proxy-server=socks5://127.0.0.1:9150',
      // `--proxy-server=${proxy}`,
      '--no-sandbox',
      // '--disable-setuid-sandbox',
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  })

  const page = await browser.newPage()
  // await page.goto('https://api.ipify.org/') // http://jsonip.com/
  await page.goto(url)

  const content = await page.content()

  browser.close()

  return content
}

@Processor(QUEUE_NAME)
export class ScraperProcessor {
  private readonly logger = new FmLogger(ScraperProcessor.name)

  constructor(
    private readonly keywordService: KeywordService,
    @InjectRedis() private readonly redis: Redis
  ) {}

  @Process(JOB_NAME)
  async handleTranscode(job: Job, doneCallback: DoneCallback) {
    try {
      await this.redis.ping()
      const requestsCount = await this.redis.get('concurrent-requests-count')
      const count = requestsCount === 'NaN' ? 0 : parseInt(requestsCount, 10)
      this.logger.debug(`count ${count}`)
      if (count && (count >= SCRAPE_REQUESTS_THRESHOLD)) { // THRESHOLD
        this.logger.debug(`Throttling for ${SCRAPE_THROTTLE_TIME}ms...`)
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, SCRAPE_THROTTLE_TIME))

        await this.redis.set('concurrent-requests-count', 0)
      } else {
        await this.redis.set('concurrent-requests-count', count + 1)
      }

      this.logger.debug('Start scraping...')
      const { keyword } = job.data
      this.logger.debug(`job - keyword: ${job.id} - ${keyword}`)

      const resultInfo: ResultInfo = {}

      const url = `https://www.google.com/search?q=${keyword}`
      this.logger.debug(`Crawl: ${url}`)
      const html = await getHtmlPuppeteer(url)
      const $ = cheerioLoad(html)

      const ads = $('#tads > div > [data-text-ad]') // or [data-hveid]
      this.logger.debug(`ads: ${ads}`)
      resultInfo.adwordsCount = ads.length

      const allLinks = $('a')
      // console.log('allLinks', allLinks)
      resultInfo.linksCount = allLinks.length

      const resultStats = $('#result-stats').text()
      this.logger.debug(`resultStats: ${resultStats}`)
      resultInfo.resultStats = resultStats

      resultInfo.rawHtml = $.html()

      const foundKeywordRecord = await this.keywordService.findOneByJob(String(job.id))
      if (foundKeywordRecord) {
        await this.keywordService.update(foundKeywordRecord.id, {
          ...resultInfo,
          isFinishedScraping: true
        })
      }

      doneCallback(null, {
        keyword,
        keywordRecordId: foundKeywordRecord && foundKeywordRecord.id,
        success: true
      })
      this.logger.debug('Scraping completed')
    } catch (err: any) {
      this.logger.error(`err: ${err.message}`)
    }
  }
}
