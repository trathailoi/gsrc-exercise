import {
  BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

@Entity()
export class User extends BaseEntity {
  @ApiProperty({ format: 'uuid', example: 'f620a1bf-d317-4bcb-a190-0213bede890b' })
  @PrimaryGeneratedColumn('uuid')
    id!: string

  @ApiProperty({ format: 'email', example: 'somebody@hotmail.com' })
  @Unique(['email'])
  @Column()
    email: string

  @ApiProperty({ format: 'string', example: 'Tom' })
  @Column({
    nullable: true
  })
    firstName?: string

  @ApiProperty({ format: 'string', example: 'Cruise' })
  @Column({
    nullable: true
  })
    lastName?: string

  @Exclude()
  @Column()
    password: string

  @ApiProperty({ type: 'boolean', example: true })
  @Column({ default: true })
    isActive: boolean

  @ApiProperty({ type: Date, example: '2022-04-19T02:25:49.272Z' })
  @CreateDateColumn({
    type: 'timestamptz',
    default: 'now()'
  })
    createdAt?: Date

  @ApiProperty({ type: Date, example: '2022-04-19T02:25:49.272Z' })
  @UpdateDateColumn({
    type: 'timestamptz',
    default: 'now()'
  })
    modifiedAt?: Date

  constructor(partial?: Partial<User>) {
    super()
    Object.assign(this, partial)
  }

  @Expose()
  get fullName(): string {
    const names = []
    if (this.firstName) {
      names.push(this.firstName)
    }
    if (this.lastName) {
      names.push(this.lastName)
    }
    return names.join(' ')
  }

  toJSON() {
    delete this.password
    return this
  }
}
