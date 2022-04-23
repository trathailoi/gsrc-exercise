import { Test, TestingModule } from '@nestjs/testing'

import { UserController } from './user.controller'
import { UserService } from './user.service'
import { Mapper } from '../common/mapper'
import { User } from './user.entity'

describe('UserController', () => {
  let userController: UserController
  let userService: UserService

  beforeEach(async () => {
    const user: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        Mapper,
        {
          provide: UserService,
          useValue: {
            // from src/common/base.service.ts
            create: jest.fn(),
            findAll: jest.fn()
          }
        }
      ]
    }).compile()

    userController = user.get<UserController>(UserController)
    userService = user.get<UserService>(UserService)
  })

  afterEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(userController).toBeDefined()
  })

  describe('create', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      const sampleData = {
        email: 'user-email',
        password: 'user-password',
        firstName: 'user-first-name',
        lastName: 'user-last-name',
        fullName: 'user-full-name'
      }
      const sampleResult = { identifiers: [{ id: 'user-id' }] }
      jest.spyOn(userService, 'create').mockResolvedValueOnce(sampleResult as never)

      const result = await userController.create(sampleData as never)

      expect(userService.create).toHaveBeenCalledWith(sampleData)
      expect(result).toStrictEqual(sampleResult.identifiers[0])
    })
  })

  describe('findAll', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      jest.spyOn(userService, 'findAll').mockResolvedValueOnce({ data: [], count: 2 })

      const result = await userController.findAll(10, 1)

      expect(userService.findAll).toBeCalled()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('count')
    })
  })
})
