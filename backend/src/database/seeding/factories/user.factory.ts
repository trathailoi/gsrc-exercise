import * as Faker from '@faker-js/faker'
import { define } from 'typeorm-seeding'

import { User } from '../../../user/user.entity'

define(User, (faker: typeof Faker.faker) => {
  const user = new User()
  user.email = faker.internet.email()
  user.password = 'Y0uKnowWh@tItIs'
  user.firstName = faker.name.firstName()
  user.lastName = faker.name.lastName()
  return user
})
