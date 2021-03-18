import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { v4 as uuid } from 'uuid';
import { User } from "./User";

@Entity('organizations')
export class Organization {

  @PrimaryColumn()
  readonly id: string

  @Column()
  name: string

  @Column()
  id_name: string

  @Column()
  description: string

  @Column()
  picture_url: string

  @Column()
  active: boolean

  @Column()
  owner_id: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User

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