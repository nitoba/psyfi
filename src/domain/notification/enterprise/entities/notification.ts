import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Email } from '@/domain/core/enterprise/value-objects/email'

export type NotificationProps = {
  subject: string
  content: string
  to: Email
  createdAt: Date
}

export class Notification extends Entity<NotificationProps> {
  get subject() {
    return this.props.subject
  }

  get content() {
    return this.props.content
  }

  get to() {
    return this.props.to.getValue
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<NotificationProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Notification(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}