import { addDays } from 'date-fns'
import { makePsychologist } from 'test/factories/psychologist/make-psychologist'
import { makeAppointment } from 'test/factories/schedules/make-appointment'
import { InMemoryPsychologistRepository } from 'test/repositories/psychologist/in-memory-psychologist-repository'
import { InMemoryAppointmentsRepository } from 'test/repositories/schedules/in-memory-appointments-repository'

import { ResourceNotFound } from '@/core/errors/use-cases/resource-not-found'

import { FetchScheduledAppointmentsFromPsychologistUseCase } from './fetch-scheduled-appointments-from-psychologist'

let useCase: FetchScheduledAppointmentsFromPsychologistUseCase
let psychologistRepository: InMemoryPsychologistRepository
let appointmentsRepository: InMemoryAppointmentsRepository

describe('FetchScheduledAppointmentsFromPsychologistUseCase', () => {
  beforeEach(() => {
    psychologistRepository = new InMemoryPsychologistRepository()
    appointmentsRepository = new InMemoryAppointmentsRepository()
    useCase = new FetchScheduledAppointmentsFromPsychologistUseCase(
      psychologistRepository,
      appointmentsRepository,
    )
    vi.useFakeTimers({
      now: new Date(),
    })
  })

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers()
  })

  it('should return scheduled appointments for valid psychologist', async () => {
    const psychologist = makePsychologist()
    psychologistRepository.create(psychologist)

    const appointment1 = makeAppointment({ psychologistId: psychologist.id })
    const appointment2 = makeAppointment({ psychologistId: psychologist.id })

    appointmentsRepository.appointments.push(appointment1, appointment2)

    const result = await useCase.execute({
      psychologistId: psychologist.id.toString(),
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      expect(result.value.scheduledAppointments).toEqual([
        appointment1,
        appointment2,
      ])
    }
  })

  it('should return scheduled appointments for valid psychologist paginated', async () => {
    const psychologist = makePsychologist()
    psychologistRepository.create(psychologist)

    for (let i = 0; i < 12; i++) {
      const appointment = makeAppointment({ psychologistId: psychologist.id })
      appointmentsRepository.appointments.push(appointment)
    }

    const result = await useCase.execute({
      psychologistId: psychologist.id.toString(),
      page: 2,
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      expect(result.value.scheduledAppointments).toHaveLength(2)
    }
  })

  it('should filter appointments by period when is valid period', async () => {
    const date = new Date(2024, 3, 10, 13)
    vi.setSystemTime(date)
    const psychologist = makePsychologist()
    psychologistRepository.create(psychologist)

    const appointment1 = makeAppointment({
      psychologistId: psychologist.id,
      scheduledTo: new Date('03-12-2024'),
    })
    const appointment2 = makeAppointment({
      psychologistId: psychologist.id,
      scheduledTo: addDays(new Date('03-12-2024'), 15),
    })

    appointmentsRepository.appointments.push(appointment1, appointment2)

    const result = await useCase.execute({
      psychologistId: psychologist.id.toString(),
      page: 1,
      period: {
        from: new Date('03-10-2024'),
        to: new Date('03-17-2024'),
      },
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.scheduledAppointments).toHaveLength(1)
    }
  })

  it('should return left with invalid period error for invalid period', async () => {
    const psychologist = makePsychologist()
    psychologistRepository.create(psychologist)

    const result = await useCase.execute({
      psychologistId: psychologist.id.toString(),
      page: 1,
      period: {
        from: new Date('03-10-2024'),
        to: new Date('03-26-2024'),
      },
    })

    expect(result.isLeft()).toBeTruthy()
  })

  it('should return left with not found error if invalid psychologist', async () => {
    const result = await useCase.execute({
      psychologistId: 'invalid',
      page: 1,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFound)
  })
})

describe('FetchScheduledAppointmentsFromPsychologistUseCase filter status', () => {
  beforeEach(() => {
    psychologistRepository = new InMemoryPsychologistRepository()
    appointmentsRepository = new InMemoryAppointmentsRepository()
    useCase = new FetchScheduledAppointmentsFromPsychologistUseCase(
      psychologistRepository,
      appointmentsRepository,
    )
  })
  it('should filter scheduled appointments by status finished', async () => {
    const psychologist = makePsychologist()
    const finishedAppointment = makeAppointment({
      status: 'finished',
      psychologistId: psychologist.id,
    })
    const appointment = makeAppointment({ psychologistId: psychologist.id })

    psychologistRepository.create(psychologist)
    appointmentsRepository.appointments = [finishedAppointment, appointment]

    const result = await useCase.execute({
      psychologistId: psychologist.id.toString(),
      status: 'finished',
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      expect(result.value.scheduledAppointments).toHaveLength(1)
    }
  })

  it('should return empty list if no appointments match filter', async () => {
    const psychologist = makePsychologist()
    const finishedAppointment = makeAppointment({
      status: 'canceled',
      psychologistId: psychologist.id,
    })
    const appointment = makeAppointment({ psychologistId: psychologist.id })

    psychologistRepository.create(psychologist)
    appointmentsRepository.appointments = [finishedAppointment, appointment]

    const result = await useCase.execute({
      psychologistId: psychologist.id.toString(),
      status: 'finished',
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      expect(result.value.scheduledAppointments).toHaveLength(0)
    }
  })
})
