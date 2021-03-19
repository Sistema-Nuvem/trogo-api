import { FindOneOptions, getCustomRepository } from "typeorm";
import { Member } from "../../models/Member";
import { MemberRepository } from "../../repositories/MemberRepository";

interface MemberResult {
  entity: Member
  repository: MemberRepository
}

export async function getMember(options: FindOneOptions): Promise<MemberResult> {

  const repository = getCustomRepository(MemberRepository)

  return {
    entity: await repository.findOne(options),
    repository,
  }
}

export async function getMemberWithOrganization(options: FindOneOptions | string): Promise<MemberResult> {
  
  return await getMember({
    where: typeof options === 'string' ? {id: options } : options.where,
    relations: ['organization']
  })
}