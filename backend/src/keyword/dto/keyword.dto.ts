import { ApiProperty } from '@nestjs/swagger'

export class KeywordDto implements Readonly<KeywordDto> {
  @ApiProperty({ type: 'string', example: 'Basketball shoes' })
    name: string
}
