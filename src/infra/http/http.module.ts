import { Module } from '@nestjs/common'

import { AuthenticatePatientUseCase } from '@/domain/auth/application/use-cases/authenticate-patient'
import { AuthenticatePsychologistUseCase } from '@/domain/auth/application/use-cases/authenticate-psychologist'
import { ChangePasswordFromPatientUseCase } from '@/domain/auth/application/use-cases/change-patient-password'
import { ChangePasswordFromPsychologistUseCase } from '@/domain/auth/application/use-cases/change-psychologist-password'
import { RegisterPatientUseCase } from '@/domain/auth/application/use-cases/register-patient'
import { RegisterPsychologistUseCase } from '@/domain/auth/application/use-cases/register-psychologist'
import { FetchProfileUseCase as FetchProfileFromPatientUseCase } from '@/domain/patient/application/use-cases/fetch-profile'
import { ApproveOrderUseCase } from '@/domain/payment/application/use-cases/approve-order'
import { CancelOrderUseCase } from '@/domain/payment/application/use-cases/cancel-order'
import { RequestPaymentUseCase } from '@/domain/payment/application/use-cases/request-payment'
import { AddAvailableTimeUseCase } from '@/domain/psychologist/application/use-cases/add-available-time'
import { FetchAvailableTimesUseCase } from '@/domain/psychologist/application/use-cases/fetch-available-times'
import { FetchProfileUseCase as FetchProfileFromPsychologistUseCase } from '@/domain/psychologist/application/use-cases/fetch-profile'
import { FetchPsychologistsUseCase } from '@/domain/psychologist/application/use-cases/fetch-psychologists'
import { RemoveAvailableTimeUseCase } from '@/domain/psychologist/application/use-cases/remove-available-time'
import { UpdateAvailableTimesUseCase } from '@/domain/psychologist/application/use-cases/update-available-times'
import { UpdateSpecialtyUseCase } from '@/domain/psychologist/application/use-cases/update-specialties'
import { ApproveAppointmentUseCase } from '@/domain/schedules/application/use-cases/approve-appointment'
import { CancelScheduledAppointmentUseCase } from '@/domain/schedules/application/use-cases/cancel-scheduled-appointment'
import { FetchScheduledAppointmentsFromPatientUseCase } from '@/domain/schedules/application/use-cases/fetch-scheduled-appointments-from-patient'
import { FetchScheduledAppointmentsFromPsychologistUseCase } from '@/domain/schedules/application/use-cases/fetch-scheduled-appointments-from-psychologist'
import { FetchTimesAvailableToSchedulesUseCase } from '@/domain/schedules/application/use-cases/fetch-times-available-to-schedules'
import { FinishScheduledAppointmentUseCase } from '@/domain/schedules/application/use-cases/finish-scheduled-appointment'
import { RejectAppointmentUseCase } from '@/domain/schedules/application/use-cases/reject-appointment'
import { RequestScheduleAppointmentUseCase } from '@/domain/schedules/application/use-cases/request-schedule-appointment'

import { AuthModule } from '../auth/auth.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { PaymentModule } from '../payment/payment.module'
import { AuthenticatePatientController } from './controllers/auth/authenticate-patient.controller'
import { AuthenticatePsychologistController } from './controllers/auth/authenticate-psychologist.controller'
import { ChangePasswordController } from './controllers/auth/change-password.controller'
import { FetchProfileController } from './controllers/auth/fetch-profile.controller'
import { RegisterPatientController } from './controllers/auth/register-patient.controller'
import { RegisterPsychologistController } from './controllers/auth/register-psychologist.controller'
import { ApproveOrderController } from './controllers/payment/approve-order.controller'
import { CancelOrderController } from './controllers/payment/cancel-order.controller'
import { RequestOrderPaymentController } from './controllers/payment/request-payment.controller'
import { AddAvailableTimesController } from './controllers/psychologist/add-available-times.controller'
import { FetchAvailableTimesController } from './controllers/psychologist/featch-available-times.controller'
import { FetchPsychologistsController } from './controllers/psychologist/fetch-psychologists.controller'
import { RemoveAvailableTimesController } from './controllers/psychologist/remove-available-times.controller'
import { UpdateAvailableTimesController } from './controllers/psychologist/update-available-times.controller'
import { UpdateSpecialtiesController } from './controllers/psychologist/update-specialties.controller'
import { ApproveAppointmentController } from './controllers/schedules/approve-appointment.controller'
import { CancelScheduledAppointmentController } from './controllers/schedules/cancel-scheduled-appointment.controller'
import { FetchScheduledAppointmentsFromPatientController } from './controllers/schedules/fetch-scheduled-appointments-from-patient.controller'
import { FetchScheduledAppointmentsFromPsychologistController } from './controllers/schedules/fetch-scheduled-appointments-from-psychologist.controller'
import { FetchAvailableTimesToSchedulesController } from './controllers/schedules/fetch-times-available-to-schedules.controller'
import { FinishScheduledAppointmentController } from './controllers/schedules/finish-scheduled-appointment.controller'
import { RejectAppointmentController } from './controllers/schedules/reject-appointment.controller'
import { RequestScheduleAppointmentController } from './controllers/schedules/request-schedule-appointment.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule, AuthModule, PaymentModule],
  controllers: [
    // Auth Controllers
    RegisterPatientController,
    RegisterPsychologistController,
    AuthenticatePatientController,
    AuthenticatePsychologistController,
    FetchProfileController,
    ChangePasswordController,
    // Psychologists Controllers
    UpdateSpecialtiesController,
    AddAvailableTimesController,
    RemoveAvailableTimesController,
    UpdateAvailableTimesController,
    FetchPsychologistsController,
    FetchAvailableTimesController,
    // Schedules Controllers
    FetchAvailableTimesToSchedulesController,
    RequestScheduleAppointmentController,
    CancelScheduledAppointmentController,
    FinishScheduledAppointmentController,
    FetchScheduledAppointmentsFromPsychologistController,
    FetchScheduledAppointmentsFromPatientController,
    ApproveAppointmentController,
    RejectAppointmentController,
    // Payment Controllers
    RequestOrderPaymentController,
    ApproveOrderController,
    CancelOrderController,
  ],
  providers: [
    // Auth UseCases
    RegisterPatientUseCase,
    RegisterPsychologistUseCase,
    AuthenticatePatientUseCase,
    AuthenticatePsychologistUseCase,
    ChangePasswordFromPatientUseCase,
    ChangePasswordFromPsychologistUseCase,
    // Psychologists UseCases
    UpdateSpecialtyUseCase,
    AddAvailableTimeUseCase,
    RemoveAvailableTimeUseCase,
    UpdateAvailableTimesUseCase,
    FetchPsychologistsUseCase,
    FetchProfileFromPsychologistUseCase,
    FetchAvailableTimesUseCase,
    // Patient UseCases
    FetchProfileFromPatientUseCase,
    // Schedules UseCases
    FetchTimesAvailableToSchedulesUseCase,
    RequestScheduleAppointmentUseCase,
    CancelScheduledAppointmentUseCase,
    FinishScheduledAppointmentUseCase,
    FetchScheduledAppointmentsFromPsychologistUseCase,
    FetchScheduledAppointmentsFromPatientUseCase,
    ApproveAppointmentUseCase,
    RejectAppointmentUseCase,
    // Payments UseCases
    ApproveOrderUseCase,
    CancelOrderUseCase,
    RequestPaymentUseCase,
  ],
})
export class HttpModule {}
