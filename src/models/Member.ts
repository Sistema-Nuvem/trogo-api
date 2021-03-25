import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { Organization } from './Organization';
import { User } from './User';

@Entity('members')
export class Member {

  @PrimaryColumn()
   readonly id: string

  @Column()
  organization_id: string

  @ManyToOne(() => Organization, organization => organization.members)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column()
  user_id: string

  @ManyToOne(() => User /*, user => user.members*/)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  role: string

  @CreateDateColumn()
  created_at: Date

  constructor() {
    if (!this.id) {
      this.id = uuid()
    }
  }
}