import {
  PipeTransform, Injectable, ArgumentMetadata, BadRequestException
} from '@nestjs/common'
import { ObjectSchema } from 'joi'

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private mySchema: { param?: ObjectSchema, body?: ObjectSchema, query?: ObjectSchema }) {}

  transform(value: any, metadata: ArgumentMetadata) {
    let inputValue = value
    if (metadata.data) {
      inputValue = { [metadata.data]: value }
    }
    const { error } = this.mySchema[metadata.type].validate(inputValue, { abortEarly: false })
    if (error) {
      const reasons = error.details.map((detail: { message: string }) => detail.message).join(', ')
      throw new BadRequestException(
        `Request validation of ${metadata.type} ${
          metadata.data ? `item '${metadata.data}' ` : ''
        }failed, because: ${reasons}`
      )
    }
    return value
  }
}
