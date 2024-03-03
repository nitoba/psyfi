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
import { AvailableTimesFactory } from 'test/factories/psychologist/make-available-times'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Encrypter } from '@/domain/auth/application/cryptography/encrypter'
import { Time } from '@/domain/psychologist/enterprise/value-objects/time'
import { AppModule } from '@/infra/app.module'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { DrizzleService } from '@/infra/database/drizzle/drizzle.service'

describe('Request Schedule Appointment (E2E)', () => {
  let app: NestFastifyApplication<RawServerDefault>
  let authPsychologistFactory: AuthPsychologistFactory
  let authPatientFactory: AuthPatientFactory
  let availableTimesFactory: AvailableTimesFactory
  let encrypter: Encrypter
  let drizzleService: DrizzleService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, CryptographyModule],
      providers: [
        AuthPsychologistFactory,
        AuthPatientFactory,
        AvailableTimesFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )

    app.register(fastifyCookie)
    authPsychologistFactory = moduleRef.get(AuthPsychologistFactory)
    authPatientFactory = moduleRef.get(AuthPatientFactory)
    availableTimesFactory = moduleRef.get(AvailableTimesFactory)
    encrypter = moduleRef.get(Encrypter)
    drizzleService = moduleRef.get(DrizzleService)

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    vi.clearAllTimers()
    vi.useRealTimers()
    await app.close()
  })

  test('[POST] /appointments', async () => {
    vi.useFakeTimers().setSystemTime(new Date(2024, 1, 25, 8))
    const psychologist = await authPsychologistFactory.makeDbPsychologist()
    await availableTimesFactory.makeDbAvailableTime(
      {
        psychologistId: new UniqueEntityID(psychologist.id),
        weekday: 0,
        time: Time.create('09:00').value as Time,
      },
      psychologist.id,
    )
    const patient = await authPatientFactory.makeDbPatient()

    const token = await encrypter.encrypt({
      sub: patient.id.toString(),
      role: 'patient',
    })

    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Cookie', [`psify@access_token=${token}`])
      .send({
        psychologistId: psychologist.id.toString(),
        scheduledTo: new Date(2024, 1, 25, 9),
      })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      id: expect.any(String),
      psychologistId: psychologist.id.toString(),
      patientId: patient.id.toString(),
      scheduledTo: expect.any(String),
      costInCents: expect.any(Number),
      status: 'pending',
    })

    const appointment =
      await drizzleService.client.query.appointments.findFirst({
        where: (ap, { eq, and }) =>
          and(
            eq(ap.psychologistId, psychologist.id.toString()),
            eq(ap.patientId, patient.id.toString()),
            eq(ap.status, 'pending'),
          ),
      })

    expect(appointment).toBeDefined()
  })
})
