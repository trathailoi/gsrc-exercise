import { ApiProperty } from '@nestjs/swagger'
import { User } from '../../user/user.entity'

export class KeywordResultDto implements Readonly<KeywordResultDto> {
  @ApiProperty({ type: 'uuid', example: 'f620a1bf-d317-4bcb-a190-0213bede890b' })
    id?: string

  @ApiProperty({ type: 'string', example: 'Basketball shoes' })
    name?: string

  @ApiProperty({ type: 'string', example: '2' })
    jobQueueId?: string

  @ApiProperty({ type: 'boolean', example: false })
    isFinishedScraping?: boolean

  @ApiProperty({ type: 'boolean', example: true })
    isActive?: boolean

  @ApiProperty({ type: 'boolean', example: false })
    isArchived?: boolean

  @ApiProperty({ type: Date, example: '2022-04-19T02:25:49.272Z' })
    createdAt?: Date

  @ApiProperty({ type: Date, example: '2022-04-19T02:25:49.272Z' })
    modifiedAt?: Date

  @ApiProperty({ type: 'integer', example: 2, required: false })
    adwordsCount?: number

  @ApiProperty({ type: 'integer', example: 116, required: false })
    linksCount?: number

  @ApiProperty({ type: 'string', example: 'About 158,000,000 results (0.48 seconds)', required: false })
    resultStats?: string

  @ApiProperty({ type: 'string', example: '<html><body></body></html>', required: false })
    rawHtml?: string

  @ApiProperty({ type: User, isArray: false })
    createdBy?: User

  @ApiProperty({ type: User, isArray: false })
    modifiedBy?: User
}
