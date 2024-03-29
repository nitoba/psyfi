import { differenceInDays } from 'date-fns'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { AppointmentsRepository } from '@/domain/schedules/application/repositories/appointments-repository'
import {
  Appointment,
  AppointmentStatuses,
} from '@/domain/schedules/enterprise/entities/appointment'

export class InMemoryAppointmentsRepository implements AppointmentsRepository {
  appointments: Appointment[] = []

  async create(appointment: Appointment): Promise<void> {
    this.appointments.push(appointment)
    DomainEvents.dispatchEventsForAggregate(appointment.id)
  }

  async findById(id: string): Promise<Appointment | null> {
    const appointment = this.appointments.find((ap) => ap.id.toString() === id)

    return appointment ?? null
  }

  async findManyByPatientId(
    filter: {
      statuses?: AppointmentStatuses[]
      period?: { from: Date; to: Date }
    },
    { page }: PaginationParams,
    patientId: UniqueEntityID,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const offset = (page - 1) * 10

    const appointmentsFromPsychologist = this.appointments.filter((ap) => {
      if (!filter.period && !filter.statuses) {
        return (
          differenceInDays(new Date(), ap.scheduledTo) <= 7 &&
          ap.patientId.equals(patientId)
        )
      }

      if (!filter.period && filter.statuses) {
        return (
          filter.statuses.includes(ap.status) &&
          differenceInDays(new Date(), ap.scheduledTo) <= 7 &&
          ap.patientId.equals(patientId)
        )
      }

      // scheduled to: 12-03-2024
      // from: 10-03-2024
      // to: 17-03-2024
      if (!filter.statuses && filter.period) {
        return (
          ap.scheduledTo > filter.period.from &&
          ap.scheduledTo < filter.period.to &&
          ap.patientId.equals(patientId)
        )
      }

      return false
    })

    return {
      appointments: appointmentsFromPsychologist.slice(offset, offset + 10),
      total: appointmentsFromPsychologist.length,
    }
  }

  async findManyByPsychologistId(
    filter: {
      status?: AppointmentStatuses | undefined
      period?: { from: Date; to: Date } | undefined
    },
    { page }: PaginationParams,
    psychologistId: UniqueEntityID,
  ): Promise<{
    appointments: Appointment[]
    total: number
  }> {
    const offset = (page - 1) * 10

    const appointmentsFromPsychologist = this.appointments.filter((ap) => {
      if (!filter.period && !filter.status) {
        return (
          differenceInDays(new Date(), ap.scheduledTo) <= 7 &&
          ap.psychologistId.equals(psychologistId)
        )
      }

      if (!filter.period && filter.status) {
        return (
          ap.status === filter.status &&
          differenceInDays(new Date(), ap.scheduledTo) <= 7 &&
          ap.psychologistId.equals(psychologistId)
        )
      }

      // scheduled to: 12-03-2024
      // from: 10-03-2024
      // to: 17-03-2024
      if (!filter.status && filter.period) {
        return (
          ap.scheduledTo > filter.period.from &&
          ap.scheduledTo < filter.period.to &&
          ap.psychologistId.equals(psychologistId)
        )
      }

      return false
    })

    return {
      appointments: appointmentsFromPsychologist.slice(offset, offset + 10),
      total: appointmentsFromPsychologist.length,
    }
  }

  async save(appointment: Appointment): Promise<void> {
    const appointmentIndex = this.appointments.findIndex((ap) =>
      ap.id.equals(appointment.id),
    )

    this.appointments[appointmentIndex] = appointment

    DomainEvents.dispatchEventsForAggregate(appointment.id)
  }
}
