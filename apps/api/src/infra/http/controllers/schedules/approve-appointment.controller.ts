import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common'
import { z } from 'zod'

import { ResourceNotFound } from '@/core/errors/use-cases/resource-not-found'
import { InvalidResource } from '@/domain/core/enterprise/errors/invalid-resource'
import { ApproveAppointmentUseCase } from '@/domain/schedules/application/use-cases/approve-appointment'
import { Roles } from '@/infra/auth/decorators/roles-decorator'
import { Role } from '@/infra/auth/roles'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'

const approveAppointmentParamsSchema = z
  .string({ required_error: 'appointmentId is required!' })
  .uuid({ message: 'order id must be a uuid' })

const appointmentIdValidator = new ZodValidationPipe(
  approveAppointmentParamsSchema,
)

@Controller('/schedules/appointments/:appointmentId/approve')
export class ApproveAppointmentController {
  constructor(private readonly useCase: ApproveAppointmentUseCase) {}

  @Put()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Psychologist)
  async handle(
    @Param('appointmentId', appointmentIdValidator)
    appointmentId: string,
  ) {
    const result = await this.useCase.execute({
      appointmentId,
    })

    if (
      result.isLeft() &&
      (result.value instanceof ResourceNotFound ||
        result.value instanceof InvalidResource)
    ) {
      throw new BadRequestException(result.value)
    }

    if (result.isRight()) {
      return {
        message: 'Appointment approved successfully!',
      }
    }
  }
}
