import { ApiProperty } from '@nestjs/swagger'

export class KeywordDto implements Readonly<KeywordDto> {
  @ApiProperty({ type: 'string', example: 'Basketball shoes' })
    name: string

  // @ApiProperty({ type: 'integer', example: 2, required: false })
  //   adwordsCount?: number

  // @ApiProperty({ type: 'integer', example: 116, required: false })
  //   linksCount?: number

  // @ApiProperty({ type: 'string', example: 'About 158,000,000 results (0.48 seconds)', required: false })
  //   resultStats?: string

  // @ApiProperty({ type: 'string', example: '<html><body></body></html>', required: false })
  //   rawHtml?: string
}
