import { makeOrder } from 'test/factories/payment/make-order'
import { makeAppointment } from 'test/factories/schedules/make-appointment'
import { InMemoryOrderRepository } from 'test/repositories/payment/in-memory-order-repository'
import { InMemoryAppointmentsRepository } from 'test/repositories/schedules/in-memory-appointments-repository'
import { waitFor } from 'test/utils/wait-for'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { OrderItem } from '../../enterprise/entities/order-item'
import { ApproveOrderUseCase } from '../use-cases/approve-order'
import { OnAppointmentApprovedHandler } from './on-appointment-approved'

describe('On Appointment Approved Handler', () => {
  let approveOrderUseCase: ApproveOrderUseCase
  let appointmentRepository: InMemoryAppointmentsRepository
  let orderRepository: InMemoryOrderRepository

  beforeEach(() => {
    appointmentRepository = new InMemoryAppointmentsRepository()
    orderRepository = new InMemoryOrderRepository()
    approveOrderUseCase = new ApproveOrderUseCase(orderRepository)

    // eslint-disable-next-line no-new
    new OnAppointmentApprovedHandler(
      approveOrderUseCase,
      appointmentRepository,
      orderRepository,
    )
  })

  it('should approve order when appointment is approved', async () => {
    const approveOrderUseCaseSpy = vi.spyOn(approveOrderUseCase, 'execute')
    const appointment = makeAppointment()
    appointmentRepository.create(appointment)

    const orderId = new UniqueEntityID()
    const order = makeOrder(
      {
        costumerId: appointment.patientId,
        sellerId: appointment.psychologistId,
        orderItems: [
          OrderItem.create({
            itemId: appointment.id,
            name: 'Appointment',
            orderId,
            priceInCents: 1000,
            quantity: 1,
          }),
        ],
      },
      orderId,
    )
    orderRepository.orders.push(order)

    order.approve()

    await waitFor(() => {
      expect(approveOrderUseCaseSpy).toHaveBeenCalled()
    })
    expect(orderRepository.orders[0].status).toBe('approved')
    // expect(appointmentRepository.appointments[0].status).toBe('inactive')
  })
})