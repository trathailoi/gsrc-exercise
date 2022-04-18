import { Global, Module } from '@nestjs/common'
import { FmLogger } from './logger.service'

@Global()
@Module({
  providers: [FmLogger],
  exports: [FmLogger]
})
export class LoggerModule {
}
