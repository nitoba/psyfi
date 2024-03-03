import { randomUUID } from 'crypto'
import { config } from 'dotenv'
import { Client } from 'pg'
import { exec } from 'shelljs'

import { DomainEvents } from '@/core/events/domain-events'
import { envSchema } from '@/infra/env/env'
config({ path: '.env.test', override: true })
const env = envSchema.parse(process.env)
const connections: Client[] = []

const dbName = randomUUID()

beforeAll(async () => {
  const connection = new Client({
    connectionString: env.DATABASE_URL,
  })

  connections.push(connection)

  DomainEvents.shouldRun = false
  await connection.connect()

  await connection.query(`CREATE DATABASE "${dbName}"`)

  process.env = {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL?.replace('psify_test', dbName),
  }

  exec('npm run migrate')
})

afterAll(async () => {
  for (const connection of connections) {
    await connection.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`)
    await connection.end()
  }
})
