import * as utils from './utils'

describe('Utils', () => {
  afterEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  describe('generateHash', () => {
    it('should be defined #POSITIVE', () => {
      expect(utils.generateHash).toBeDefined()
    })
    it('should be implemented correctly #POSITIVE', () => {
      expect(utils.generateHash).toBeDefined()
      const result = utils.generateHash('some-password')
      expect(result).toEqual(expect.any(String))
    })
  })

  describe('comparePwd', () => {
    it('should be defined #POSITIVE', () => {
      expect(utils.comparePwd).toBeDefined()
    })

    it.each([
      {
        plain: 'Zxc@1234',
        hashed: '$2a$10$6J02/glgH5h6aKajPi231OZai/yabM5x0Mf3P9i7ybdiX7TQVAVxq'
      },
      {
        plain: 'Y0uKnowWh@tItIs',
        hashed: '$2a$10$ve3O8CcaRKDy3RnyT5oxQerimS1IAb3T88RCXM7MlqnC.7bTIQ5Aa'
      }
    ])('should tell $plain is equal to $hashed', ({ plain, hashed }) => {
      expect(utils.comparePwd(plain, hashed)).toEqual(true)
    })
  })

  describe('readCsvAsync', () => {
    it('should be defined #POSITIVE', () => {
      expect(utils.readCsvAsync).toBeDefined()
    })

    it('should be implemented correctly #POSITIVE', async () => {
      expect(utils.readCsvAsync).toBeDefined()
      const result = await utils.readCsvAsync('some-password')
      expect(result).toEqual(expect.any(Array))
    })
  })

  describe('standardizeQueuedJobId', () => {
    it('should be defined #POSITIVE', () => {
      expect(utils.standardizeQueuedJobId).toBeDefined()
    })

    it.each([
      'random-string-1',
      'random-string-2',
      'random-string-3'
    ])('should return standard id format for %s', (originalId) => {
      const result = utils.standardizeQueuedJobId(originalId)
      const tmpArr = result.split('-')
      const datePart = tmpArr.pop()
      expect(datePart).toEqual(expect.any(String))
      expect(datePart).toHaveLength(13)
      expect(originalId).toEqual(tmpArr.join('-'))
    })
  })
})
