import { join } from 'path'
import * as Joi from 'joi'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'
// import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

import { UserSubscriber } from '../user/user.subscriber'

export const dbConfig = (): TypeOrmModuleOptions & { seeds: string[]; factories: string[] } => ({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  subscribers: [UserSubscriber],
  migrations: [join(__dirname, '../database/migration/**/*{.ts,.js}')],
  seeds: [join(__dirname, '../database/seeding/seeds/**/*{.ts,.js}')],
  factories: [join(__dirname, '../database/seeding/factories/**/*{.ts,.js}')],
  cli: {
    migrationsDir: join(__dirname, '../database/migration'),
    entitiesDir: join(__dirname, '../**/*.entity{.ts,.js}')
  }
})

export const validationSchema = Joi.object({
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required()
})

export default dbConfig()
