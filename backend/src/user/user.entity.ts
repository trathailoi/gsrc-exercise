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
  // @Column({ select: false })
  @Column()
    password: string

  @Column({ default: true })
    isActive: boolean

  // @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn({
    type: 'timestamptz',
    default: 'now()'
    // nullable: true
  })
    createdAt?: Date

  // @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn({
    type: 'timestamptz',
    default: 'now()'
    // nullable: true
  })
    modifiedAt?: Date

  // @CreateDateColumn({
  //   default: 'now()',
  //   update: false,
  //   nullable: true
  // })
  //   createdAt: string

  // @UpdateDateColumn({
  //   default: 'now()',
  //   nullable: true
  // })
  //   updatedAt: string

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
