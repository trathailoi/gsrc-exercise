import * as request from 'supertest'

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'

import { AppModule } from '../src/app.module'
import { User } from '../src/user/user.entity'

const USER_REPOSITORY_TOKEN = getRepositoryToken(User)
const sampleUserCredentials = {
  email: 'somebody@hotmail.com',
  password: 'Y0uKnowWh@tItIs'
}
const sampleKeyword = {
  name: 'gitops'
}
// let userId = ''
let token = ''
let keywordId = ''

describe('Main user stories only', () => {
  let app: INestApplication
  let httpServer: any

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
  })

  // afterAll(async () => {
  //   await app.close()
  // })

  beforeEach(() => {
    httpServer = app.getHttpServer()
  })

  afterEach(() => {
    // Close the server instance after each test
    httpServer.close()
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
    token = response.body.access_token
  })

  // it('should NOT create a keyword WITHOUT authorization #NEGATIVE', async () => {
  //   // logout
  //   await request(httpServer).get('/authen/signout')
  //   const creatingResponse = await request(httpServer)
  //     .post('/keywords')
  //     .set('Content-type', 'application/json')
  //     .send(sampleKeyword)
  //     .expect(401)
  //   expect(creatingResponse.status).toEqual(401)

  //   // signin
  //   await request(httpServer)
  //     .post('/authen/signin')
  //     .set('Content-type', 'application/json')
  //     .send(sampleUserCredentials)
  //     .expect(200)

  //   const gettingResponse = await request(httpServer)
  //     .get(`/keywords/${keywordId}`)
  //     .set('Content-type', 'application/json')
  //     .set('Authorization', `Bearer ${token}`)
  //     .expect(404)
  //   expect(gettingResponse.status).toEqual(404)
  // })

  it('should create a keyword successfully WITH authorization #POSITIVE', async () => {
    const creatingResponse = await request(httpServer)
      .post('/keywords')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleKeyword)
      .expect(201)
    expect(creatingResponse.status).toEqual(201)
    expect(creatingResponse.body).toHaveProperty('id')
    keywordId = creatingResponse.body.id

    const gettingResponse = await request(httpServer)
      .get(`/keywords/${keywordId}`)
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(gettingResponse.status).toEqual(200)
    expect(gettingResponse.body).toEqual(expect.objectContaining(sampleKeyword))
    expect(gettingResponse.body.id).toBe(keywordId)
  })

  // it('should NOT get the keywords list WITHOUT authorization #NEGATIVE', async () => {
  //   const response = await request(httpServer)
  //     .get('/keywords')
  //     .set('Content-type', 'application/json')
  //     .expect(401)
  //   expect(response.status).toEqual(401)
  // })
})
