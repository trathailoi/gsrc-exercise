import 'automapper-ts'
import { Injectable } from '@nestjs/common'

import { User } from '../user/user.entity'
import { CreateUserDto } from '../user/dto/create-user.dto'

import { Keyword } from '../keyword/keyword.entity'
import { KeywordDto } from '../keyword/dto/keyword.dto'
import { KeywordResultDto } from '../keyword/dto/keyword.result.dto'

/**
 * Wrapper around automapper, for dependency injection convenience (static/global variables bad)
 */
@Injectable()
class Mapper {
  /**
     * Helper method, shorthand for 'map all properties of the source to the same properties in
     * the destination'.  This is useful when your model and entity share the same structuer.
     */
  private createDefaultMap(
    fromType: any,
    toType: any,
    fields: Array<string>
  ): AutoMapperJs.ICreateMapFluentFunctions {
    const map = automapper.createMap(fromType, toType)
    fields.forEach((key) => {
      map.forMember(key, (opts: AutoMapperJs.IMemberConfigurationOptions) => opts.mapFrom(key))
    })

    return map
  }

  /**
     * Helper method, creates mappings between two types in both directions
     */
  private createDefaultBiDiMap(
    typeA: any,
    typeB: any,
    fields: Array<string>
  ): Array<AutoMapperJs.ICreateMapFluentFunctions> {
    return [
      this.createDefaultMap(typeA, typeB, fields),
      this.createDefaultMap(typeB, typeA, fields)
    ]
  }

  constructor() {
    // Add code here to configure mappings
    this.createDefaultBiDiMap(
      CreateUserDto,
      User,
      ['id', 'email', 'firstName', 'lastName', 'password']
    )

    this.createDefaultBiDiMap(
      KeywordDto,
      Keyword,
      ['id', 'name', 'jobQueueId', 'isFinishedScraping', 'adwordsCount', 'linksCount', 'resultStats', 'rawHtml', 'createdBy', 'modifiedBy']
    )

    this.createDefaultBiDiMap(
      KeywordResultDto,
      Keyword,
      ['id', 'name', 'jobQueueId', 'isFinishedScraping', 'adwordsCount', 'linksCount', 'resultStats', 'rawHtml', 'createdBy', 'modifiedBy']
    )
  }

  public map(source: any, destination: any, value: any): any {
    const obj = automapper.map(source, destination, value)
    return Object.keys(obj).reduce((tmpObj, key) => ({ ...tmpObj, ...(obj[key] !== undefined ? { [key]: obj[key] } : {}) }), {})
  }
}

export { Mapper }
