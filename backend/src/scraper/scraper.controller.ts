import {
  BadRequestException,
  Controller,
  Get,
  Param, Post,
  Req, Res, UploadedFile, UseInterceptors
} from '@nestjs/common'
import { Response } from 'express'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger'

import { readCsvAsync } from '../common/utils'
import { QUEUE_NAME } from '../constants/job-queue'
import FileUploadDto from './file-upload.dto'

import { KeywordService } from '../keyword/keyword.service'

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(
    @InjectQueue(QUEUE_NAME) private readonly scrapeQueue: Queue,
    private readonly keywordService: KeywordService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(csv)$/)) {
        req.fileValidationError = 'Only support image files'
        return cb(null, false)
      }
      return cb(null, true)
    },
    limits: { fileSize: 1024 * 1024 } // 1MB
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A CSV file containing the keywords to be processed',
    type: FileUploadDto
  })
  async processFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const rows: string[] = await readCsvAsync(file.buffer)
    if (rows.length > 100) {
      throw new BadRequestException('Too many keywords')
    }
    return this.keywordService.createMany(rows.map((r) => ({ name: r })), req.user)
  }

  @Get(':id')
  async getJobResult(@Res() response: Response, @Param('id') id: string) {
    const job = await this.scrapeQueue.getJob(id)

    if (!job) {
      return response.sendStatus(404)
    }

    const isCompleted = await job.isCompleted()

    if (!isCompleted) {
      return response.sendStatus(202)
    }

    const { rawHtml, ...result } = job.returnvalue

    return response.json(result)
  }
}
