import { AuthPsychologistRepository } from '@/domain/auth/application/repositories/auth-psychologist-repository'
import { Psychologist } from '@/domain/auth/enterprise/entities/psychologist'

export class InMemoryAuthPsychologistRepository
  implements AuthPsychologistRepository
{
  async findByEmailOrCRP(
    email: string,
    crp: string,
  ): Promise<Psychologist | null> {
    const psychologist = this.psychologists.find(
      (p) => p.email === email || p.crp.value === crp,
    )
    return psychologist ?? null
  }

  psychologists: Psychologist[] = []
  async findById(id: string): Promise<Psychologist | null> {
    const psychologist = this.psychologists.find((p) => p.id.toString() === id)
    return psychologist ?? null
  }

  async findByEmail(email: string): Promise<Psychologist | null> {
    const psychologist = this.psychologists.find((p) => p.email === email)
    return psychologist ?? null
  }

  async create(psychologist: Psychologist): Promise<void> {
    this.psychologists.push(psychologist)
  }

  async save(psychologist: Psychologist): Promise<void> {
    const index = this.psychologists.findIndex((p) => p.equals(psychologist))

    if (index !== -1) {
      this.psychologists[index] = psychologist
    }
  }
}
