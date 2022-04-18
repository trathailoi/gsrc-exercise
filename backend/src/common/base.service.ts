import {
  // InsertResult, UpdateResult,
  DeleteResult, Repository
} from 'typeorm'
import type { EntityId } from 'typeorm/repository/EntityId'
import { FmLogger } from '../logger/logger.service'
// import { User } from '../user/user.entity'

export class BaseService<T> {
  protected readonly logger = new FmLogger(this.constructor.name)

  constructor(protected readonly repository: Repository<T>) {}

  // create(entity: T | Array<T>, createdBy: User): Promise<InsertResult> {
  //   const entities = Array.isArray(entity) ? entity : [entity]
  //   return this.repository.insert(entities.map((e: T) => ({ ...e, createdBy })))
  // }

  // update(id: EntityId, entity: T, modifiedBy: User): Promise<UpdateResult> {
  //   return this.repository.update(id, { ...entity, modifiedBy })
  // }

  async findAll(queryObject?: { where?, relations?: string[], pagination?: { pageSize?: number, currentPage?: number }, order?, select? }): Promise<{ data: Array<T>, count: number }> {
    const defaultPaginationConf = { take: 20, skip: 0 } // skip: take * (page - 1)
    let queryObj = {}
    if (queryObject?.where && Object.keys(queryObject?.where).length > 0) {
      queryObj = { ...queryObj, where: queryObject?.where }
    }
    if (queryObject?.relations && queryObject?.relations.length > 0) {
      queryObj = { ...queryObj, relations: queryObject?.relations }
    }
    if (queryObject?.select && queryObject?.select.length > 0) {
      queryObj = { ...queryObj, select: queryObject?.select }
    }
    if (queryObject?.pagination && Object.keys(queryObject?.pagination).length > 0) {
      if (queryObject.pagination.pageSize) {
        defaultPaginationConf.take = queryObject.pagination.pageSize
      }
      if (queryObject.pagination.currentPage) {
        defaultPaginationConf.skip = defaultPaginationConf.take * (queryObject.pagination.currentPage - 1)
      }
      queryObj = { ...queryObj, ...defaultPaginationConf }
      // just for reference: this.repository.find({ take, skip: take * (page - 1) });
    }
    if (queryObject?.order && Object.keys(queryObject?.order).length > 0) {
      queryObj = { ...queryObj, order: queryObject?.order }
      // TODO: order by multiple fields
      // this.repository.findAndCount({
      //     order: {
      //         name: 'ASC',
      //         id: 'DESC'
      //     }
      // })
    }
    this.logger.debug(JSON.stringify(queryObj, null, 2), 'findAll - queryObj')
    const result = await this.repository.findAndCount(queryObj)
    return {
      data: result[0],
      count: result[1]
    }
  }

  findOne(id: EntityId): Promise<T | undefined> {
    return this.repository.findOne(id)
  }

  findByIds(ids: [EntityId]): Promise<T[]> {
    return this.repository.findByIds(ids)
  }

  delete(id: EntityId): Promise<DeleteResult> {
    return this.repository.delete(id)
  }
}
