import type { Logger as TypeOrmLogger, QueryRunner } from 'typeorm'
import { FmLogger } from './logger.service'
import { appConfig } from '../app.config'

const healthCheckQueryString = 'SELECT 1'

class DatabaseLogger implements TypeOrmLogger {
  private readonly logger = new FmLogger('SQL')

  logQuery(query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
    if (this.skipLoggingCheck(query, parameters, queryRunner)) {
      return
    }
    this.logger.log(`${query} -- Parameters: ${this.stringifyParameters(parameters)}`)
  }

  logQueryError(error: string, query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
    if (this.skipLoggingCheck(query, parameters, queryRunner)) {
      return
    }
    this.logger.error(`${query} -- Parameters: ${this.stringifyParameters(parameters)} -- ${error}`)
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
    if (this.skipLoggingCheck(query, parameters, queryRunner)) {
      return
    }
    this.logger.warn(`Time: ${time} -- Parameters: ${this.stringifyParameters(parameters)} -- ${query}`)
  }

  logMigration(message: string) {
    this.logger.log(message)
  }

  logSchemaBuild(message: string) {
    this.logger.log(message)
  }

  log(level: 'log' | 'info' | 'warn', message: string, queryRunner?: QueryRunner) {
    if (queryRunner?.data?.isCreatingLogs) {
      return
    }
    if (level === 'log') {
      this.logger.log(message)
      return
    }
    if (level === 'info') {
      this.logger.debug(message)
      return
    }
    if (level === 'warn') {
      this.logger.warn(message)
    }
  }

  private stringifyParameters(parameters?: unknown[]) {
    try {
      return JSON.stringify(parameters)
    } catch {
      return ''
    }
  }

  private skipLoggingCheck(query: string, parameters?: unknown[], queryRunner?: QueryRunner): boolean {
    if (queryRunner?.data?.isCreatingLogs) {
      return true
    }
    if (!appConfig.showHealthLogs() && query === healthCheckQueryString) {
      return true
    }
    return false
  }
}

export default DatabaseLogger
