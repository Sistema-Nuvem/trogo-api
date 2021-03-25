import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { v4 as uuid } from 'uuid';
import { Member } from "./Member";
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

  @OneToMany(() => Member, member => member.organization)
  members: Member[]

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