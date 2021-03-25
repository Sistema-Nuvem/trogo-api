import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { v4 as uuid } from 'uuid';

@Entity('users')
export class User {

  @PrimaryColumn()
  readonly id: string

  @Column()
  login: string
  
  @Column()
  active: boolean

  @Column()
  name: string

  @Column()
  plataform: string

  @Column()
  avatar_url: string

  @Column()
  email: string

  @Column()
  password_hash: string

  /*@OneToMany(() => Member, member => member.user)
  members: Member[]*/

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