import { Test, TestingModule } from '@nestjs/testing'
import { getMockReq, getMockRes } from '@jest-mock/express'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

const singinData = {
  email: 'somebody@hotmail.com',
  password: 'Y0uKnowWh@tItIs'
}
const signupData = {
  ...singinData,
  confirmPassword: 'Y0uKnowWh@tItIs'
}

const req = getMockReq()
const { res } = getMockRes()

describe('AuthController', () => {
  let authController: AuthController
  let authService: AuthService

  beforeEach(async () => {
    const auth: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            // from src/common/base.service.ts
            signup: jest.fn(),
            login: jest.fn()
          }
        }
      ]
    }).compile()

    authController = auth.get<AuthController>(AuthController)
    authService = auth.get<AuthService>(AuthService)
  })

  afterEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(authController).toBeDefined()
  })

  describe('create', () => {
    it('should be defined', () => {
      expect(authController.create).toBeDefined()
    })
    it('should be implemented correctly #POSITIVE', async () => {
      jest.spyOn(authService, 'signup').mockResolvedValue({ identifiers: [{ id: 'user-id' }] } as never)

      const result = await authController.create(signupData)

      expect(authService.signup).toHaveBeenCalledWith(signupData)
      expect(result).toEqual({ id: 'user-id' })
    })
  })
  describe('login', () => {
    it('should be defined', () => {
      expect(authController.login).toBeDefined()
    })
    it('should be implemented correctly #POSITIVE', async () => {
      const spyJson = jest.fn()
      jest.spyOn(authService, 'login').mockResolvedValue({ identifiers: [{ id: 'user-id' }] } as never)
      jest.spyOn(res, 'status').mockReturnValue({ json: spyJson } as never)

      await authController.login(req, res)

      expect(res.cookie).toHaveBeenCalled()
      expect(spyJson).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
  describe('logout', () => {
    it('should be defined', () => {
      expect(authController.logout).toBeDefined()
    })
    it('should be implemented correctly #POSITIVE', async () => {
      await authController.logout(req, res)
      expect(res.clearCookie).toHaveBeenCalled()
    })
  })
  describe('check', () => {
    it('should be defined', () => {
      expect(authController.check).toBeDefined()
    })
    it('should be implemented correctly #POSITIVE', async () => {
      const sampleUserData = { id: 'user-id', email: 'somebody@hotmail.com' }
      const result = await authController.check({ user: sampleUserData })
      expect(result).toStrictEqual(sampleUserData)
    })
  })
})
