import 'dotenv/config'
import * as Joi from 'joi'
import { RedisOptions } from 'ioredis'

export class AppConfig {
  constructor(private env: { [k: string]: string | undefined }) { }

  getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key]
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`)
    }

    return value
  }

  ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true))
    return this
  }

  getPort() {
    return this.getValue('PORT', true)
  }

  getGlobalPrefix() {
    // return this.getValue('API_PREFIX', true)
    return 'api'
  }

  getApiVersion() {
    return this.getValue('API_VERSION', true)
  }

  getClientUrl() {
    return this.getValue('CLIENT_URL', true) // || 'http://localhost:8080'
  }

  getAuthTokenKey() {
    return this.getValue('AUTH_TOKEN_KEY', true) // || 'http://localhost:8080'
  }

  isProduction() {
    const mode = this.getValue('MODE', false)
    return mode === 'PROD' || process.env.NODE_ENV === 'production'
  }

  isTest() {
    const mode = this.getValue('MODE', false)
    return mode === 'TEST' || process.env.NODE_ENV === 'test'
  }

  isDebug() {
    return this.getValue('DEBUG', false) === 'true'
  }

  isVerbose() {
    return this.getValue('VERBOSE', false) === 'true'
  }

  showHealthLogs() {
    return this.getValue('SHOW_HEALTH_LOGS', false) === 'true'
  }

  showDbLogs() {
    return this.getValue('SHOW_DB_LOGS', false) === 'true'
  }

  getGeneralValidationSchema() {
    return Joi.object({
      PORT: Joi.number().default(this.getPort()),
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development')
    })
  }

  getRedisConfig(): RedisOptions {
    return {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379
    }
  }

  getRedisConfigValidationSchema() {
    return Joi.object({
      REDIS_HOST: Joi.string().required(),
      REDIS_PORT: Joi.number().required()
    })
  }

  getScrapeConfig() {
    const requestThrehold = this.getValue('SCRAPE_REQUESTS_THRESHOLD', false)
    const throttleTime = this.getValue('SCRAPE_THROTTLE_TIME', false)
    return {
      SCRAPE_REQUESTS_THRESHOLD: Number.isNaN(requestThrehold) ? 3 : parseInt(requestThrehold, 10),
      SCRAPE_THROTTLE_TIME: Number.isNaN(throttleTime) ? 3000 : parseInt(throttleTime, 10),
      getRandomProxy: () => {
        const ports = process.env.PROXY_PORTS ? String(process.env.PROXY_PORTS).split(',') : ['9150', '9152', '9153', '9154']
        const host = String(this.getValue('PROXY_HOST'))
        const randomPort = ports[Math.floor(Math.random() * ports.length)]
        return `socks5://${host}:${randomPort}`
      }
    }
  }
}

export const appConfig = new AppConfig(process.env)
