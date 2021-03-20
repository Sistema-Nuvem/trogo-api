import { FindManyOptions, FindOneOptions, getCustomRepository, ObjectLiteral } from "typeorm";
import { Member } from "../../models/Member";
import { MemberRepository } from "../../repositories/MemberRepository";
import { getOrganizationIdFrom } from "./organization";

interface MemberResult {
  member: Member
  repository: MemberRepository
}


interface MembersResult {
  members: {
    organization_id: string
    items: Member[]
  }
  repository: MemberRepository
}

export function getMemberRepository() {
  return getCustomRepository(MemberRepository)
}

export async function getMember(options: FindOneOptions): Promise<MemberResult> {

  const repository = getMemberRepository()

  return {
    member: await repository.findOne(options),
    repository,
  }
}

export async function getMemberWithOrganization(options: FindOneOptions | string): Promise<MemberResult> {

  return await getMember({
    where: typeof options === 'string' ? {id: options } : options.where,
    relations: ['organization']
  })
}

export async function getMembersList(organization_id: string, withUsers: boolean | [] = false): Promise<MembersResult> {

  const repository = getMemberRepository()

  let options: ObjectLiteral | FindManyOptions = {
    organization_id,
  }

  if (withUsers) {
    options = {
      where: options,
      relations: ['user'],
    }
  }

  const items = await repository.find(options)

  items.map((item: any) => {
    item.organization_id = undefined
    if (withUsers instanceof Array) {
      let user: any = {} 
      for (const field of withUsers) {
        user[field] = item.user[field]
      }
      item.user = user
    }
  })

  const members = {
    organization_id,
    items,
  }

  return {
    members,
    repository
  }
}

export async function getMemberView(organization_id: string, user_id: string, withUser: boolean | [] = false): Promise<MemberResult> {

  const repository = getMemberRepository()

  let options: ObjectLiteral | FindOneOptions = {
    organization_id,
    user_id,
  }

  if (withUser) {
    options = {
      where: options,
      relations: ['user'],
    }
  }

  const member = await repository.findOne(options)

  if (withUser instanceof Array) {
    let user: any = {} 
    for (const field of withUser) {
      user[field] = member[field]
    }
    member.user = user
  }

  return {
    member,
    repository
  }
}