import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { v4 as uuid } from 'uuid'

@Entity('accounts')
export class Account {

  @PrimaryColumn()
  readonly id: string

  @Column()
  name: string

  @Column()
  expiration_day: number

  @Column()
  active: boolean

  @CreateDateColumn()
  created_at: Date

  constructor() {
    if (!this.id) {
      this.id = uuid()
    }
    if (this.active === undefined) {
      this.active = true
    }
  }
}