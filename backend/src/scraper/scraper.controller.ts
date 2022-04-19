import {
  Controller,
  Get,
  Param, Post,
  Res, UploadedFile, UseInterceptors
} from '@nestjs/common'
import { Response } from 'express'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
// import { diskStorage } from 'multer'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger'
import { readCsvAsync } from '../common/utils'
import FileUploadDto from './file-upload.dto'

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(
    @InjectQueue('scraper') private readonly fileQueue: Queue
  ) {}

  @Post()
  // @UseInterceptors(AnyFilesInterceptor())
  @UseInterceptors(FileInterceptor('file', {
    // storage: diskStorage({
    //   destination: './uploads',
    //   filename: (req, file, cb) => {
    //     const fileExt: string = path.extname(file.originalname)
    //     const fileName: string = path.basename(file.originalname, fileExt)
    //     cb(null, path.join(`${fileName}_${Date.now().toString()}${fileExt}`))
    //   }
    // }),
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
  async processFile(@UploadedFile() file: Express.Multer.File) {
    const rows: string[] = await readCsvAsync(file.buffer)
    const allJobs = await Promise.all(rows.map((r) => this.fileQueue.add('scrape', { keyword: r })))
    return allJobs
  }

  @Get(':id')
  async getJobResult(@Res() response: Response, @Param('id') id: string) {
    const job = await this.fileQueue.getJob(id)

    if (!job) {
      return response.sendStatus(404)
    }

    const isCompleted = await job.isCompleted()

    if (!isCompleted) {
      return response.sendStatus(202)
    }

    // const result = Buffer.from(job.returnvalue)
    const { rawHtml, ...result } = job.returnvalue
    console.log('result', result)

    return response.json(result).status(200)
  }
}
