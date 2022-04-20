import {
  Entity, PrimaryGeneratedColumn, Column,
  Unique, Check
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

import { BaseEntity } from '../common/base.entity'

@Entity()
@Check('"adwordsCount" >= 0')
@Check('"linksCount" >= 0')
@Unique('unique_keyword_per_user', ['name', 'createdBy'])
export class Keyword extends BaseEntity<Keyword> {
  @ApiProperty({ type: 'uuid', example: 'f620a1bf-d317-4bcb-a190-0213bede890b' })
  @PrimaryGeneratedColumn('uuid')
    id!: string

  @ApiProperty({ example: 'Basketball shoes' })
  @Column('varchar', {
    nullable: false,
    length: 500
  })
    name: string

  @ApiProperty({ type: 'string', example: '2' })
  @Column('varchar', {
    nullable: true,
    length: 30
  })
    jobQueueId?: string

  @ApiProperty({ type: 'boolean', example: false })
  @Column({ type: 'boolean', default: false })
    isFinishedScraping?: boolean

  @ApiProperty({ type: 'integer', example: 2, required: false })
  @Column('int', {
    nullable: true
  })
    adwordsCount?: number

  @ApiProperty({ type: 'integer', example: 116, required: false })
  @Column('int', {
    nullable: true
  })
    linksCount?: number

  @ApiProperty({ type: 'string', example: 'About 158,000,000 results (0.48 seconds)', required: false })
  @Column('varchar', {
    nullable: true,
    length: 100
  })
    resultStats?: string

  @ApiProperty({ type: 'string', example: '<html><body></body></html>', required: false })
  @Column('text', {
    nullable: true
  })
    rawHtml?: string
}
