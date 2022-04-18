import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { AppService } from './app.service'
import { MzSwaggerAuth } from './decorators/swagger.decorator'

@SkipThrottle()
@MzSwaggerAuth()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {}

  @Get()
  @ApiOkResponse({
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  @ApiOperation({ summary: 'just for testing out the authorization functionality' })
  getHello(): string {
    return this.appService.getHello()
  }
}
