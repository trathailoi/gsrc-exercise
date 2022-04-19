import { Controller, Get } from '@nestjs/common'
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  // DiskHealthIndicator,
  HealthCheck
} from '@nestjs/terminus'
import { ApiExcludeEndpoint } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { RedisHealthIndicator } from '@liaoliaots/nestjs-redis/health'
import Redis from 'ioredis'

import { MzPublic } from '../decorators/public.decorator'

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    @InjectRedis() private readonly redis: Redis
    // private disk: DiskHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @MzPublic()
  @ApiExcludeEndpoint()
  check() {
    return this.health.check([
      () => this.db.pingCheck('datatable', { timeout: 5000 }),
      () => this.redisIndicator.checkHealth('redis', { type: 'redis', client: this.redis }),
      // the process should not use more than 300MB memory
      () => this.memory.checkHeap('memory heap', 600 * 1024 * 1024)
      // the used disk storage should not exceed the 50% of the available space
      // () => this.disk.checkStorage('disk health', {
      //   thresholdPercent: 0.5, path: '/'
      // })
    ])
  }
}
