import {
  Controller,
  UsePipes, HttpCode, HttpStatus,
  Post, Get, Patch, Delete, Body, Param, Query, Req,
  NotFoundException
} from '@nestjs/common'
import {
  ApiTags, ApiCreatedResponse, ApiBadRequestResponse, ApiOkResponse, ApiNotFoundResponse, ApiNoContentResponse, ApiQuery, ApiOperation, getSchemaPath
} from '@nestjs/swagger'
import * as Joi from 'joi'

import { JoiValidationPipe } from '../common/validation.pipe'
import { MzSwaggerAuth } from '../decorators/swagger.decorator'
import { MzPublic } from '../decorators/public.decorator'

// import { Keyword } from './keyword.entity'
import { KeywordService } from './keyword.service'
import { KeywordDto } from './dto/keyword.dto'
import { KeywordResultDto } from './dto/keyword.result.dto'

@ApiTags('keywords')
@MzSwaggerAuth()
@Controller('keywords')
export class KeywordController {
  constructor(
    private readonly keywordService: KeywordService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'create a new keyword' })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'uuid',
          example: 'f620a1bf-d317-4bcb-a190-0213bede890b'
        }
      }
    }
  })
  @ApiBadRequestResponse()
  @UsePipes(new JoiValidationPipe({
    body: Joi.object().keys({
      name: Joi.string().required()
    })
  }))
  async create(@Body() keywordDto: KeywordDto, @Req() req) {
    const result = await this.keywordService.create(keywordDto, req.user)
    return result.identifiers[0]
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get keywords' })
  // @ApiOkResponse({ type: KeywordDto, isArray: true })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            allOf: [
              { $ref: getSchemaPath(KeywordResultDto) }
            ]
          }
        },
        count: {
          type: 'number',
          example: 1
        }
      }
    }
  })
  @UsePipes(new JoiValidationPipe({
    query: Joi.object({
      pageSize: Joi.number().integer().min(1).max(50)
        .default(10),
      currentPage: Joi.number().integer().min(1).default(1)
    })
  }))
  @ApiQuery({
    name: 'pageSize', required: false, schema: { minimum: 1, maximum: 50 }, description: 'Page size.'
  })
  @ApiQuery({
    name: 'currentPage', required: false, schema: { minimum: 1 }, description: 'Current page.'
  })
  @MzPublic()
  async findAll(@Query('pageSize') pageSize: number, @Query('currentPage') currentPage: number) {
    const { data, count } = await this.keywordService.findAll({
      pagination: {
        pageSize,
        currentPage
      },
      relations: ['createdBy', 'modifiedBy']
    })
    return {
      data,
      count
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get a keyword detail' })
  @ApiOkResponse({ type: KeywordResultDto, isArray: false })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @UsePipes(new JoiValidationPipe({
    param: Joi.object().keys({
      id: Joi.string().guid().required().description('ID of keyword to return')
    })
  }))
  async findOne(@Param('id') id: string) {
    const result = await this.keywordService.findOne(id)
    if (!result) {
      throw new NotFoundException()
    }
    return result
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'update a keyword (also trigger a new scraping job' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @UsePipes(new JoiValidationPipe({
    body: Joi.object().keys({
      name: Joi.string().required()
    }),
    param: Joi.object().keys({
      id: Joi.string().guid().required().description('ID of the keyword that needs to be updated')
    })
  }))
  async update(@Param('id') id: string, @Body() keywordDto: KeywordDto, @Req() req) {
    const foundRecord = await this.keywordService.findOne(id)
    if (!foundRecord) {
      throw new NotFoundException()
    }
    const result = await this.keywordService.updateKeyword(id, keywordDto, req.user)
    if (!result.affected) {
      throw new NotFoundException()
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'delete a keyword' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @UsePipes(new JoiValidationPipe({
    param: Joi.object().keys({
      id: Joi.string().guid().required().description('Keyword id to delete')
    })
  }))
  async delete(@Param('id') id: string) {
    // const foundRecord = await this.keywordService.findOne(id)
    // if (!foundRecord) {
    //   throw new NotFoundException()
    // }
    const result = await this.keywordService.delete(id)
    if (!result.affected) {
      return new NotFoundException()
    }
    return result
  }
}
