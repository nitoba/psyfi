import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg'
import { Module } from '@nestjs/common'

import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { DrizzleService } from './drizzle/drizzle.service'
import * as schema from './drizzle/schemas'

@Module({
  imports: [
    DrizzlePGModule.registerAsync({
      tag: 'DB',
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => {
        return {
          pg: {
            connection: 'client',
            config: {
              connectionString: env.get('DATABASE_URL'),
            },
          },
          config: {
            schema: { ...schema },
          },
        }
      },
    }),
  ],
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DatabaseModule {}