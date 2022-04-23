import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'

import * as utils from '../common/utils'
import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'

const sampleUserData = {
  email: 'somebody@hotmail.com',
  password: 'Y0uKnowWh@tItIs'
}

describe('AuthService', () => {
  let service: AuthService
  let userService: UserService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
    userService = module.get<UserService>(UserService)
    jwtService = module.get<JwtService>(JwtService)
  })

  afterEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(userService).toBeDefined()
    expect(jwtService).toBeDefined()
  })

  describe('validateUser', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      const sampleData = { id: 'some-id', email: sampleUserData.email, password: 'encrypted-pwd' }
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(sampleData as never)
      jest.spyOn(utils, 'comparePwd').mockReturnValue(true as never)

      const result = await service.validateUser(sampleUserData.email, sampleUserData.password)

      expect(utils.comparePwd).toHaveBeenCalledWith(sampleUserData.password, 'encrypted-pwd')
      expect(result).toEqual(sampleData)
    })
    it('should throw exception with non exist email #NEGATIVE', () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(undefined)
      jest.spyOn(utils, 'comparePwd').mockReturnValue(true as never)

      expect(service.validateUser(sampleUserData.email, sampleUserData.password)).rejects.toThrow()

      expect(utils.comparePwd).not.toHaveBeenCalled()
    })
    it('should throw exception with incorrect email or password #NEGATIVE', () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue({ id: 'some-id', email: sampleUserData.email, password: 'encrypted-pwd' } as never)
      jest.spyOn(utils, 'comparePwd').mockReturnValue(undefined)

      expect(service.validateUser(sampleUserData.email, sampleUserData.password)).rejects.toThrow()

      // expect(utils.comparePwd).toHaveBeenCalledWith(sampleUserData.password, 'encrypted-pwd')
    })
  })

  describe('signup', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      const sampleData = { password: 'abc', confirmPassword: 'abc' }
      jest.spyOn(userService, 'create').mockResolvedValue(sampleData as never)

      const result = await service.signup(sampleData)

      expect(userService.create).toHaveBeenCalledWith(sampleData)
      expect(result).toEqual(sampleData)
    })
    it('should throw exception with non matched passwords #NEGATIVE', () => {
      const sampleData = { password: 'abc', confirmPassword: 'xyz' }
      jest.spyOn(userService, 'create').mockResolvedValue(sampleData as never)

      expect(service.signup(sampleData)).rejects.toThrow()

      expect(userService.create).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      const sampleData = {
        id: 'user-id',
        email: 'user-email',
        firstName: 'user-first-name',
        lastName: 'user-last-name',
        fullName: 'user-full-name'
      }
      const sampleJwtToken = 'random-jwt-token'
      jest.spyOn(jwtService, 'sign').mockReturnValue(sampleJwtToken as never)

      const result = await service.login(sampleData)

      expect(jwtService.sign).toHaveBeenCalledWith(sampleData)
      expect(result).toEqual({
        success: true,
        access_token: sampleJwtToken,
        user: sampleData
      })
    })
  })
})
