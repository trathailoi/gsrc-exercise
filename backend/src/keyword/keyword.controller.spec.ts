import { Test, TestingModule } from '@nestjs/testing'

import { KeywordController } from './keyword.controller'
import { KeywordService } from './keyword.service'
import { Mapper } from '../common/mapper'
import { User } from '../user/user.entity'

const sampleData = {
  keywordId: '123',
  keyword: 'fastfood',
  user: new User()
}

describe('KeywordController', () => {
  let keywordController: KeywordController
  let keywordService: KeywordService

  beforeEach(async () => {
    const keyword: TestingModule = await Test.createTestingModule({
      controllers: [KeywordController],
      providers: [
        Mapper,
        {
          provide: KeywordService,
          useValue: {
            // from src/common/base.service.ts
            create: jest.fn(),
            update: jest.fn(),
            updateKeyword: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByIds: jest.fn(),
            delete: jest.fn()
          }
        }
      ]
    }).compile()

    keywordController = keyword.get<KeywordController>(KeywordController)
    keywordService = keyword.get<KeywordService>(KeywordService)
  })

  afterEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(keywordController).toBeDefined()
  })

  describe('create', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      jest.spyOn(keywordService, 'create').mockResolvedValueOnce(undefined)
      await keywordController.create({ name: sampleData.keyword }, sampleData.user)
      expect(keywordService.create).toBeDefined()
      expect(keywordService.create).toBeCalled()
    })
  })

  describe('findAll', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      jest.spyOn(keywordService, 'findAll').mockResolvedValueOnce({ data: [], count: 2 })
      const result = await keywordController.findAll(10, 1, 'food')
      expect(keywordService.findAll).toBeDefined()
      expect(keywordService.findAll).toBeCalled()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('count')
    })
  })

  describe('findOne', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      const mockFindOneResult = { id: sampleData.keywordId, name: sampleData.keyword }
      jest.spyOn(keywordService, 'findOne').mockResolvedValueOnce(mockFindOneResult as never)
      const result = await keywordController.findOne(sampleData.keywordId)
      expect(keywordService.findOne).toBeDefined()
      expect(keywordService.findOne).toBeCalledWith(sampleData.keywordId)
      expect(result).toStrictEqual(mockFindOneResult)
    })

    it('shoud throw exception on notfound response #NEGATIVE', async () => {
      jest.spyOn(keywordService, 'findOne').mockResolvedValueOnce(undefined)

      expect(keywordController.findOne(sampleData.keywordId)).rejects.toThrow()

      expect(keywordService.findOne).toBeDefined()
      expect(keywordService.findOne).toBeCalledWith(sampleData.keywordId)
    })
  })

  describe('update', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      jest.spyOn(keywordService, 'updateKeyword').mockResolvedValueOnce({ affected: { id: sampleData.keywordId } } as never)
      jest.spyOn(keywordService, 'findOne').mockResolvedValueOnce({ id: sampleData.keywordId } as never)
      await keywordController.update(sampleData.keywordId, { name: sampleData.keyword }, sampleData.user)

      expect(keywordService.updateKeyword).toBeDefined()
      expect(keywordService.updateKeyword).toBeCalled()
    })

    it('shoud throw exception on notfound response and not updating #NEGATIVE', async () => {
      jest.spyOn(keywordService, 'findOne').mockResolvedValueOnce(undefined)

      expect(keywordController.update(sampleData.keywordId, { name: sampleData.keyword }, sampleData.user)).rejects.toThrow()

      expect(keywordService.findOne).toBeDefined()
      expect(keywordService.findOne).toBeCalledWith(sampleData.keywordId)
      expect(keywordService.updateKeyword).not.toBeCalled()
    })

    it('shoud throw exception on failed updating #NEGATIVE', async () => {
      jest.spyOn(keywordService, 'findOne').mockResolvedValueOnce({ id: sampleData.keywordId } as never)
      jest.spyOn(keywordService, 'updateKeyword').mockResolvedValueOnce({ } as never)

      expect(keywordController.update(sampleData.keywordId, { name: sampleData.keyword }, sampleData.user)).rejects.toThrow()

      expect(keywordService.findOne).toBeDefined()
      expect(keywordService.findOne).toBeCalledWith(sampleData.keywordId)
      expect(keywordService.updateKeyword).not.toBeCalled()
    })
  })

  describe('delete', () => {
    it('should be implemented correctly #POSITIVE', async () => {
      const mockDeleteResult = { affected: [{ id: sampleData.keywordId }] }
      jest.spyOn(keywordService, 'delete').mockResolvedValueOnce(mockDeleteResult as never)

      const result = await keywordController.delete(sampleData.keywordId)

      expect(keywordService.delete).toBeDefined()
      expect(keywordService.delete).toBeCalledWith(sampleData.keywordId)
      expect(result).toStrictEqual(mockDeleteResult)
    })

    it('shoud throw exception on notfound response #NEGATIVE', async () => {
      jest.spyOn(keywordService, 'delete').mockResolvedValueOnce({} as never)

      expect(keywordController.delete(sampleData.keywordId)).rejects.toThrow()

      expect(keywordService.delete).toBeDefined()
      expect(keywordService.delete).toBeCalledWith(sampleData.keywordId)
    })
  })
})
