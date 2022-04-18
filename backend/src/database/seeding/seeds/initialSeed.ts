import { Factory, Seeder } from 'typeorm-seeding'
// import { Connection } from 'typeorm'

import { User } from '../../../user/user.entity'

export default class InitialDatabaseSeed implements Seeder {
  // public async run(factory: Factory, connection: Connection): Promise<void> {
  public async run(factory: Factory): Promise<void> {
    const users = await factory(User)().createMany(3)
    console.log('users', users)
  }
}
