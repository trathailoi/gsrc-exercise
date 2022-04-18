import 'dotenv/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export class AppConfig {
  constructor(private env: { [k: string]: string | undefined }) { }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key]
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`)
    }

    return value
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true))
    return this
  }

  public getPort() {
    return this.getValue('PORT', true)
  }

  public getGlobalPrefix() {
    // return this.getValue('API_PREFIX', true)
    return 'api'
  }

  public getApiVersion() {
    return this.getValue('API_VERSION', true)
  }

  public getClientUrl() {
    return this.getValue('CLIENT_URL', true) // || 'http://localhost:8080'
  }

  public getAuthTokenKey() {
    return this.getValue('AUTH_TOKEN_KEY', true) // || 'http://localhost:8080'
  }

  public isProduction() {
    const mode = this.getValue('MODE', false)
    return mode === 'PROD' || process.env.NODE_ENV === 'production'
  }

  public isTest() {
    const mode = this.getValue('MODE', false)
    return mode === 'TEST' || process.env.NODE_ENV === 'test'
  }

  public isDebug() {
    return this.getValue('DEBUG', false) === 'true'
  }

  public isVerbose() {
    return this.getValue('VERBOSE', false) === 'true'
  }

  public showHealthLogs() {
    return this.getValue('SHOW_HEALTH_LOGS', false) === 'true'
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: Number(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DB'),
      entities: ['**/*.entity{.ts,.js}'],
      migrations: ['src/database/migration/*.ts'],
      cli: {
        migrationsDir: 'src/database/migration'
      },
      ssl: this.isProduction()
    }
  }
}

const appConfig = new AppConfig(process.env)
  .ensureValues([
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB'
  ])

export { appConfig }
