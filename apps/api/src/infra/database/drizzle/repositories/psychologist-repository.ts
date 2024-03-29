import { Injectable } from '@nestjs/common'
import { eq, sql } from 'drizzle-orm'

import { PaginationParams } from '@/core/repositories/pagination-params'
import { PsychologistRepository } from '@/domain/psychologist/application/repositories/psychology-repository'
import { AvailableTimesList } from '@/domain/psychologist/enterprise/entities/available-times-list'
import { Psychologist } from '@/domain/psychologist/enterprise/entities/psychologist'
import { SpecialtyList } from '@/domain/psychologist/enterprise/entities/specialty-list'

import { DrizzleService } from '../drizzle.service'
import { toDomain } from '../mappers/psychologist-mapper'
import {
  availableTimes as availableTimesSchema,
  psychologist as psychologistSchema,
} from '../schemas/psychologist'
@Injectable()
export class DrizzlePsychologistRepository implements PsychologistRepository {
  constructor(private drizzle: DrizzleService) {}

  async findWithAvailableTimesToSchedule(
    id: string,
  ): Promise<Psychologist | null> {
    const psychologist = await this.drizzle.client.query.psychologist.findFirst(
      {
        where: (p, { eq }) => eq(p.id, id),
        with: {
          availableTimes: true,
          scheduledAppointments: {
            where: (sap, { eq, and }) =>
              and(eq(sap.status, 'approved'), eq(sap.status, 'pending')),
          },
        },
      },
    )

    if (!psychologist) return null

    return toDomain(psychologist)
  }

  async update(psychologist: Psychologist): Promise<void> {
    this.drizzle.client
      .update(psychologistSchema)
      .set({
        name: psychologist.name.getValue,
        phone: psychologist.phone.getValue,
        consultationPriceInCents: psychologist.consultationPriceInCents,
        specialties: psychologist.specialties.getUpdatedItems(),
        updatedAt: new Date(),
      })
      .where(eq(psychologistSchema.id, psychologist.id.toString()))
  }

  async updateSpecialties(
    specialties: SpecialtyList,
    id: string,
  ): Promise<void> {
    // specialties.getUpdatedItems()
    await this.drizzle.client
      .update(psychologistSchema)
      .set({
        specialties: specialties.getUpdatedItems(),
        updatedAt: new Date(),
      })
      .where(eq(psychologistSchema.id, id))
  }

  async updateAvailableTimes(
    availableTimes: AvailableTimesList,
    id: string,
  ): Promise<void> {
    await this.drizzle.client.transaction(async (tx) => {
      if (availableTimes.getRemovedItems().length) {
        const idsToDelete = availableTimes
          .getRemovedItems()
          .map(({ id }) => `'${id.toString()}'`)
          .join(', ')
        await tx.execute(
          sql.raw(
            `DELETE FROM available_times WHERE available_times.id IN (${idsToDelete})`,
          ),
        )
      }

      if (availableTimes.getNewItems().length) {
        const newAvailableTimes = availableTimes
          .getNewItems()
          .map((availableTime) => ({
            weekday: availableTime.weekday,
            time: availableTime.time.value,
            psychologistId: id,
          }))
        await tx.insert(availableTimesSchema).values(newAvailableTimes)
      }

      if (availableTimes.updatedItems.length) {
        const queries = availableTimes.updatedItems.map((update) =>
          tx
            .update(availableTimesSchema)
            .set({
              time: update.time.value,
              weekday: update.weekday,
            })
            .where(eq(availableTimesSchema.id, update.id.toString())),
        )

        await Promise.all(queries)
      }
    })
  }

  async findMany(
    filter: { name?: string; specialties?: string[] },
    { page }: PaginationParams,
  ): Promise<Psychologist[]> {
    const perPage = 10
    const offset = (page - 1) * perPage
    const psychologists = await this.drizzle.client.query.psychologist.findMany(
      {
        where:
          !filter.name && !filter.specialties
            ? undefined
            : ({ name, specialties }, { ilike, sql, or }) => {
                if (filter.name && !filter.specialties?.length) {
                  return ilike(name, `%${filter.name}%`)
                }

                if (
                  !filter.name &&
                  filter.specialties &&
                  filter.specialties?.length > 0
                ) {
                  const params = `{${filter.specialties.map((v) => `"${v.toLowerCase()}"`).join(', ')}}`

                  return sql`(SELECT ARRAY(SELECT LOWER(unnest(${specialties})))) @> ${params}`
                }

                if (
                  filter.name &&
                  filter.specialties &&
                  filter.specialties?.length > 0
                ) {
                  const params = `{${filter.specialties.map((v) => `"${v.toLowerCase()}"`).join(', ')}}`
                  return or(
                    ilike(name, `%${filter.name}%`),
                    sql`(SELECT ARRAY(SELECT LOWER(unnest(${specialties})))) @> ${params}`,
                  )
                }
              },
        limit: perPage,
        offset,
        with: {
          availableTimes: true,
          scheduledAppointments: true,
        },
      },
    )

    return psychologists.map(toDomain)
  }

  async create(entity: Psychologist) {
    console.log(entity)
  }

  async findById(id: string): Promise<Psychologist | null> {
    const psychologist = await this.drizzle.client.query.psychologist.findFirst(
      {
        where: (p, { eq }) => eq(p.id, id),
        with: {
          availableTimes: true,
          scheduledAppointments: true,
        },
      },
    )

    if (!psychologist) return null

    return toDomain(psychologist)
  }
}
