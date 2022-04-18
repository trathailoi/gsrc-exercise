import {
  Controller, Post, Get, Body, Query, HttpCode, HttpStatus, UsePipes
} from '@nestjs/common'
import {
  ApiTags, ApiBody, ApiCreatedResponse, ApiOperation, ApiQuery
} from '@nestjs/swagger'
import * as Joi from 'joi'
import { joiPassword } from 'joi-password'

import { JoiValidationPipe } from '../common/validation.pipe'
import { CreateUserDto } from './dto/create-user.dto'
import { UserService } from './user.service'

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  @Post()
  @ApiOperation({ summary: 'create new user (for development purpose)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'firstName', 'lastName', 'password'],
      properties: {
        email: { type: 'email', example: 'somebody@hotmail.com' },
        firstName: { type: 'string', example: 'Tom' },
        lastName: { type: 'string', example: 'Cruise' },
        password: { type: 'string', example: 'Y0uKnowWh@tItIs' }
      }
    }
  })
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
  // @ApiExcludeEndpoint()
  @UsePipes(new JoiValidationPipe({
    body: Joi.object({
      email: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      password: joiPassword
        .string()
        .min(8)
        // .minOfSpecialCharacters(1)
        // .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .required()
    })
  }))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.create(createUserDto)
    return result.identifiers[0]
  }

  @Get()
  @ApiOperation({ summary: 'get users (for development purpose)' })
  // @ApiOkResponse({ type: User, tru
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
  @HttpCode(HttpStatus.OK)
  findAll(@Query('pageSize') pageSize: number, @Query('currentPage') currentPage: number) {
    return this.userService.findAll({
      pagination: {
        pageSize,
        currentPage
      }
      // select: ['id', 'email', 'firstName', 'lastName']
    })
  }
}
