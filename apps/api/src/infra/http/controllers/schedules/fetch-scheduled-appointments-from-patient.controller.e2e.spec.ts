import fastifyCookie from '@fastify/cookie'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import { RawServerDefault } from 'fastify'
import request from 'supertest'
import { AuthPatientFactory } from 'test/factories/auth/make-auth-patient'
import { AuthPsychologistFactory } from 'test/factories/auth/make-auth-psychologist'

import { Encrypter } from '@/domain/auth/application/cryptography/encrypter'
import { AppModule } from '@/infra/app.module'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { DrizzleService } from '@/infra/database/drizzle/drizzle.service'
import { appointments } from '@/infra/database/drizzle/schemas/appointment'

describe('Fetch Scheduled Appointments from Patient (E2E)', () => {
  let app: NestFastifyApplication<RawServerDefault>
  let authPsychologistFactory: AuthPsychologistFactory
  let authPatientFactory: AuthPatientFactory

  let encrypter: Encrypter
  let drizzleService: DrizzleService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, CryptographyModule],
      providers: [AuthPsychologistFactory, AuthPatientFactory],
    }).compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )

    app.register(fastifyCookie)
    authPsychologistFactory = moduleRef.get(AuthPsychologistFactory)
    authPatientFactory = moduleRef.get(AuthPatientFactory)
    encrypter = moduleRef.get(Encrypter)
    drizzleService = moduleRef.get(DrizzleService)

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    vi.useRealTimers()
    await app.close()
  })

  test('[GET] /schedules/patients/appointments', async () => {
    vi.useFakeTimers().setSystemTime(new Date(2024, 1, 25, 8))
    const psychologist = await authPsychologistFactory.makeDbPsychologist()
    const patient = await authPatientFactory.makeDbPatient()
    await drizzleService.client.insert(appointments).values({
      costInCents: 100,
      patientId: patient.id,
      psychologistId: psychologist.id,
      scheduledTo: new Date(),
      status: 'scheduled',
    })

    const token = await encrypter.encrypt({
      sub: patient.id,
      role: 'patient',
    })

    const response = await request(app.getHttpServer())
      .get(`/schedules/patients/appointments`)
      .set('Cookie', [`psify@access_token=${token}`])
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.scheduledAppointments).toHaveLength(1)
  })
})
