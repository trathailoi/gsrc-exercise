import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { InsertResult, Repository } from 'typeorm'

import { BaseService } from '../common/base.service'
import { User } from './user.entity'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {
    super(repo)
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.repo.findOne({ email })
  }

  async create(entity: CreateUserDto): Promise<InsertResult> {
    return this.repo.insert(new User(entity))
  }
}
