import {
  PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, BaseEntity as SuperBaseEntity, ManyToOne
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '../user/user.entity'

export abstract class BaseEntity<T> extends SuperBaseEntity {
  @ApiProperty({ type: 'uuid', example: 'f620a1bf-d317-4bcb-a190-0213bede890b' })
  @PrimaryGeneratedColumn('uuid')
    id?: string

  @ApiProperty({ type: 'boolean', example: true })
  @Column({ type: 'boolean', default: true })
    isActive?: boolean

  @ApiProperty({ type: 'boolean', example: false })
  @Column({ type: 'boolean', default: false })
    isArchived?: boolean

  // @Column({
  //   type: 'timestamptz',
  //   update: false,
  //   default: () => 'CURRENT_TIMESTAMP'
  // })
  //   createdTime: Date

  // @Column({
  //   type: 'timestamptz',
  //   default: () => 'CURRENT_TIMESTAMP',
  //   onUpdate: 'now()'
  // })
  //   updatedTime: Date

  @ApiProperty({ type: Date, example: '2022-04-19T02:25:49.272Z' })
  @CreateDateColumn({
    type: 'timestamptz',
    default: 'now()' // default: () => 'CURRENT_TIMESTAMP'
    // nullable: true
  })
    createdAt?: Date

  @ApiProperty({ type: Date, example: '2022-04-19T02:25:49.272Z' })
  @UpdateDateColumn({
    type: 'timestamptz',
    default: 'now()' // default: () => 'CURRENT_TIMESTAMP'
    // nullable: true
  })
    modifiedAt?: Date

  @ManyToOne('User', 'user')
    createdBy?: User

  @ManyToOne('User', 'user', {
    nullable: true
  })
    modifiedBy: User

  constructor(partial?: Partial<T>) {
    super()
    Object.assign(this, partial || {})
  }
}
