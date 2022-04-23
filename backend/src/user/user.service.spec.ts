import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { UserService } from './user.service'

const USER_REPOSITORY_TOKEN = getRepositoryToken(User)

describe('UserService', () => {
  let service: UserService
  let userRepository: Repository<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            insert: jest.fn(),
            update: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
    userRepository = module.get<Repository<User>>(USER_REPOSITORY_TOKEN)
  })

  afterEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should define userRepository', () => {
    expect(userRepository).toBeDefined()
  })

  describe('findByEmail', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      const email = 'some-email'
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({ id: 'some-id', email } as never)

      const result = await service.findByEmail(email)

      expect(userRepository.findOne).toBeCalledWith({ email })
      expect(result).toStrictEqual({ id: 'some-id', email })
    })
  })

  describe('create', () => {
    it('should be correctly implemented #POSITIVE', async () => {
      jest.spyOn(userRepository, 'insert').mockResolvedValueOnce({ id: 'some-id', email: 'some-email' } as never)

      const result = await service.create({ email: 'some-email', password: 'some-password' } as never)

      expect(userRepository.insert).toBeCalledWith(new User({ email: 'some-email', password: 'some-password' }))
      expect(result).toStrictEqual({ id: 'some-id', email: 'some-email' })
    })
  })
})
