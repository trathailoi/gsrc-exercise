import { SetMetadata } from '@nestjs/common'

export const MzPublic = () => SetMetadata('isPublic', true)
