import * as request from 'supertest'

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AppModule } from '../src/app.module'
import { User } from '../src/user/user.entity'

const USER_REPOSITORY_TOKEN = getRepositoryToken(User)
const sampleUserCredentials = {
  email: 'somebody@hotmail.com',
  password: 'Y0uKnowWh@tItIs'
}
// let userId = ''
// let token = ''

describe('Main user stories only', () => {
  let app: INestApplication
  let httpServer: any
  let userRepository: Repository<User>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {}
        }
      ]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    httpServer = app.getHttpServer()
    userRepository = moduleFixture.get<Repository<User>>(USER_REPOSITORY_TOKEN)

    // clean up database before running tests
    await userRepository.delete({})
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be a healthy backend app #POSITIVE', async () => {
    const response = await request(httpServer)
      .get('/health')
      .expect(200)
    expect(response.status).toEqual(200)
  })

  it('should signup a new user #POSITIVE', async () => {
    const response = await request(httpServer)
      .post('/authen/signup')
      .set('Content-type', 'application/json')
      .send({
        ...sampleUserCredentials,
        confirmPassword: sampleUserCredentials.password
      })
      .expect(201)
    expect(response.status).toEqual(201)
    expect(response.body).toHaveProperty('id')
    // userId = response.body.id
  })

  it('should sign that user in #POSITIVE', async () => {
    const response = await request(httpServer)
      .post('/authen/signin')
      .set('Content-type', 'application/json')
      .send(sampleUserCredentials)
      .expect(200)
    expect(response.status).toEqual(200)
    // token = response.body.access_token
  })
})
