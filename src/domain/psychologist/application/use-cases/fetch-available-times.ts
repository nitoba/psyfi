import { Either, left, right } from '@/core/either'
import { ResourceNotFound } from '@/core/errors/use-cases/resource-not-found'

import { AvailableTime } from '../../enterprise/entities/available-time'
import { PsychologistRepository } from '../repositories/psychology-repository'

type FetchAvailableTimesUseCaseRequest = {
  psychologistId: string
}

type FetchAvailableTimesUseCaseResponse = Either<
  ResourceNotFound,
  {
    availableTimes: AvailableTime[]
  }
>

export class FetchAvailableTimesUseCase {
  constructor(
    private readonly psychologistRepository: PsychologistRepository,
  ) {}

  async execute({
    psychologistId,
  }: FetchAvailableTimesUseCaseRequest): Promise<FetchAvailableTimesUseCaseResponse> {
    const psychologist =
      await this.psychologistRepository.findById(psychologistId)

    if (!psychologist) {
      return left(new ResourceNotFound('Psychologist not found'))
    }

    const currentAvailableTimes = psychologist.availableTimes.getItems()
    const scheduleAppointments = psychologist.scheduleAppointments

    // filter availableTimes to response only times more than current date now
    const availableTimes = currentAvailableTimes.filter((at) => {
      const [hourFromTime, minutesFromTime] = at.time.value
        .split(':')
        .map(Number)

      const dateToCompare = new Date()
      dateToCompare.setHours(hourFromTime, minutesFromTime)

      const isTimeNotScheduled = scheduleAppointments.every((sp) => {
        return sp.scheduledTo.getTime() !== dateToCompare.getTime()
      })

      return Date.now() <= dateToCompare.getTime() && isTimeNotScheduled
    })

    return right({
      availableTimes,
    })
  }
}
