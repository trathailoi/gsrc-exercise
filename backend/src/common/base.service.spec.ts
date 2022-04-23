import { Repository } from 'typeorm'
import { User } from '../user/user.entity'
import { BaseService } from './base.service'

describe('BaseService', () => {
  let baseRepository: Repository<User>
  let service: BaseService<User>

  beforeEach(async () => {
    baseRepository = new Repository<User>()
    service = new BaseService<User>(baseRepository)
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

  it('should define baseRepository', () => {
    expect(baseRepository).toBeDefined()
  })

  describe('findAll', () => {
    it('should be implemented correctly #1 #POSITIVE', async () => {
      jest.spyOn(baseRepository, 'findAndCount').mockResolvedValueOnce([[{}], 1] as never)

      const result = await service.findAll({
        where: {
          name: '123'
        },
        relations: ['createdBy'],
        select: ['name'],
        pagination: {
          pageSize: 10,
          currentPage: 1
        },
        order: { name: 'DESC' }
      })

      expect(baseRepository.findAndCount).toHaveBeenCalled()
      expect(result).toStrictEqual({ data: [{}], count: 1 })
    })
    it('should be implemented correctly #2 #POSITIVE', async () => {
      jest.spyOn(baseRepository, 'findAndCount').mockResolvedValueOnce([[{}], 1] as never)

      const result = await service.findAll()

      expect(baseRepository.findAndCount).toHaveBeenCalled()
      expect(result).toStrictEqual({ data: [{}], count: 1 })
    })
    it('should be implemented correctly #3 #POSITIVE', async () => {
      jest.spyOn(baseRepository, 'findAndCount').mockResolvedValueOnce([[{}], 1] as never)

      const result = await service.findAll({})

      expect(baseRepository.findAndCount).toHaveBeenCalled()
      expect(result).toStrictEqual({ data: [{}], count: 1 })
    })
  })

  describe('findOne', () => {
    it('should be implemented correctly #1 #POSITIVE', async () => {
      const sampleEntity = { name: 'some-name' }
      jest.spyOn(baseRepository, 'findOne').mockResolvedValueOnce(sampleEntity as never)

      const result = await service.findOne('some-id')

      expect(baseRepository.findOne).toHaveBeenCalled()
      expect(result).toStrictEqual(sampleEntity)
    })
  })

  describe('findByIds', () => {
    it('should be implemented correctly #1 #POSITIVE', async () => {
      const sampleEntity = [{ name: 'some-name' }]
      jest.spyOn(baseRepository, 'findByIds').mockResolvedValueOnce(sampleEntity as never)

      const result = await service.findByIds(['some-id'])

      expect(baseRepository.findByIds).toHaveBeenCalled()
      expect(result).toStrictEqual(sampleEntity)
    })
  })

  describe('delete', () => {
    it('should be implemented correctly #1 #POSITIVE', async () => {
      jest.spyOn(baseRepository, 'delete').mockResolvedValueOnce({ affected: 4 } as never)

      const result = await service.delete('some-id')

      expect(baseRepository.delete).toHaveBeenCalled()
      expect(result).toStrictEqual({ affected: 4 })
    })
  })
})
