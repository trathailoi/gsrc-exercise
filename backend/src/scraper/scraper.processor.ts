import { chromium } from 'playwright'
import { load as cheerioLoad } from 'cheerio'
import { Process, Processor } from '@nestjs/bull'
import { Job, DoneCallback } from 'bull'

import { QUEUE_NAME, JOB_NAME } from '../constants/job-queue'
import { FmLogger } from '../logger/logger.service'

import { KeywordService } from '../keyword/keyword.service'

// import { proxies } from './proxies.factory'
// const proxyServerUri = proxies[Math.floor(Math.random() * proxies.length)]
// console.log('proxyServerUri', proxyServerUri)

const getHtml = async (url: string) => {
  const browser = await chromium.launch({
    // proxy: { server: proxyServerUri }
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(url)
  const html = await page.content()
  await browser.close()

  return html
}

type ResultInfo = Record<string, unknown> | {
  adwordsCount: number,
  linksCount: number,
  resultStats: string,
  rawHtml: string
}

const crawl = async (keyword: string) => {
  const url = `https://www.google.com/search?q=${keyword}`
  console.log('Crawl: ', url)
  const resultInfo: ResultInfo = {
    adwordsCount: 2,
    linksCount: 116,
    resultStats: 'About 158,000,000 results (0.48 seconds)',
    rawHtml: '<html><body></body></html>'
  }

  // const html = await getHtml(url)
  // const $ = cheerioLoad(html)

  // const ads = $('#tads > div > [data-text-ad]') // or [data-hveid]
  // console.log('ads', ads)
  // resultInfo.adwordsCount = ads.length

  // const allLinks = $('a')
  // console.log('allLinks', allLinks)
  // resultInfo.linksCount = allLinks.length

  // const resultStats = $('#resultStats').text()
  // console.log('resultStats', resultStats)
  // resultInfo.resultStats = resultStats

  // resultInfo.rawHtml = $.html()

  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return resultInfo
}

@Processor(QUEUE_NAME)
export class ScraperProcessor {
  private readonly logger = new FmLogger(ScraperProcessor.name)

  constructor(private readonly keywordService: KeywordService) {}

  @Process(JOB_NAME)
  async handleTranscode(job: Job, doneCallback: DoneCallback) {
    this.logger.log('Start scraping...')
    const { keyword } = job.data
    this.logger.log(`job - keyword: ${job.id} - ${keyword}`)

    const resultInfo = await crawl(keyword)
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
    this.logger.log('Scraping completed')
  }
}
