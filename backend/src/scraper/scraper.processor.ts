import { chromium } from 'playwright'
import { load as cheerioLoad } from 'cheerio'
import { Process, Processor } from '@nestjs/bull'
import { Job, DoneCallback } from 'bull'

// import { proxies } from './proxies.factory'
import { FmLogger } from '../logger/logger.service'

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
  const resultInfo: ResultInfo = {}
  const html = await getHtml(url)
  const $ = cheerioLoad(html)

  const ads = $('#tads > div > [data-text-ad]') // or [data-hveid]
  console.log('ads', ads)
  resultInfo.adwordsCount = ads.length

  const allLinks = $('a')
  console.log('allLinks', allLinks)
  resultInfo.linksCount = allLinks.length

  const resultStats = $('#resultStats').text()
  console.log('resultStats', resultStats)
  resultInfo.resultStats = resultStats

  resultInfo.rawHtml = $.html()

  return resultInfo
}

@Processor('scraper')
export class ScraperProcessor {
  private readonly logger = new FmLogger(ScraperProcessor.name)

  @Process('scrape')
  async handleTranscode(job: Job, doneCallback: DoneCallback) {
    this.logger.log('Start scraping...')
    const { keyword } = job.data
    this.logger.log('keyword', keyword)
    // TODO: save to db
    // const resultInfo = await crawl(keyword)
    // console.log('resultInfo', resultInfo)

    doneCallback(null, { keyword })
    this.logger.log('Scraping completed')
  }
}
