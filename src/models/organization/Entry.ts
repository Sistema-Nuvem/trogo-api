import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { v4 as uuid } from 'uuid'

import { Account } from './Account'
import { Document } from "./Document";

@Entity('entries')
export class Entry {

  @PrimaryColumn()
  readonly id: string

  @Column()
  payed: boolean

  @Column()
  expiration: string

  @Column()
  account_id: string

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account

  @Column()
  value: number

  @Column()
  code: string

  @Column()
  document_id: string

  @OneToOne(() => Document)
  @JoinColumn({ name: 'document_id' })
  document: Document

  @CreateDateColumn()
  created_at: Date

  constructor() {
    if (!this.id) {
      this.id = uuid()
    }
    if (this.payed === undefined) {
      this.payed = false
    }
  }
}