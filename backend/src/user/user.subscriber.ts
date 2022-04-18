import type {
  EntitySubscriberInterface,
  InsertEvent
  // UpdateEvent
} from 'typeorm'
import { EventSubscriber } from 'typeorm'

import { generateHash } from '../common/utils'
import { User } from './user.entity'

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo(): typeof User {
    return User
  }

  beforeInsert(event: InsertEvent<User>): void {
    if (event.entity.password) {
      // eslint-disable-next-line no-param-reassign
      event.entity.password = generateHash(event.entity.password)
    }
  }

  // beforeUpdate(event: UpdateEvent<User>): void {
  //   // FIXME check event.databaseEntity.password
  //   const entity = event.entity as User

  //   if (entity.password !== event.databaseEntity.password) {
  //     entity.password = generateHash(entity.password!)
  //   }
  // }
}
