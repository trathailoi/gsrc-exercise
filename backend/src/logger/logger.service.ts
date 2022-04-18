import {
  ConsoleLogger, LoggerService,
  Injectable, Scope
} from '@nestjs/common'
import type { LogLevel } from '@nestjs/common'
import { appConfig } from '../app.config'

@Injectable({ scope: Scope.TRANSIENT })
export class FmLogger extends ConsoleLogger implements LoggerService {
  constructor(
    context: string,
    options?: {
      timestamp?: boolean;
    }
  ) {
    super(context, options)
    // super.debug(`isProduction: ${appConfig.isProduction()} --- isDebug: ${appConfig.isDebug()}`)
    if (!appConfig.isDebug()) {
      const lvs: LogLevel[] = ['error', 'warn', 'log']
      // super.log(`get rid of "verbose" and "debug" logs on production, only ${lvs} logs will be shown`)
      super.setLogLevels(lvs)
    }
    if (appConfig.isTest()) {
      super.setLogLevels([])
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private loggingSaving(...allTheArgs): void {
    // TO DO: save logs to database here, or ELK stack will do it
    // console.log(allTheArgs)
  }

  error(...allTheArgs): void {
    this.loggingSaving(allTheArgs)
    super.error(allTheArgs)
  }

  warn(...allTheArgs): void {
    this.loggingSaving(allTheArgs)
    super.warn(allTheArgs)
  }

  log(...allTheArgs): void {
    this.loggingSaving(allTheArgs)
    super.log(allTheArgs)
  }

  debug(...allTheArgs): void {
    this.loggingSaving(allTheArgs)
    super.debug(allTheArgs)
  }

  verbose(...allTheArgs): void {
    this.loggingSaving(allTheArgs)
    super.verbose(allTheArgs)
  }

  showHealth(...allTheArgs): void {
    // if (appConfig.showHealthLogs()) {
    this.loggingSaving(allTheArgs)
    super.verbose(allTheArgs)
    // }
  }
}
