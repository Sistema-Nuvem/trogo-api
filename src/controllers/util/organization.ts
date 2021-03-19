import { NextFunction } from "express"
import { exception } from "node:console"
import { getCustomRepository, Like } from "typeorm"
import { validate } from "uuid"
import { Organization } from "../../models/Organization"
import { MemberRepository } from "../../repositories/MemberRepository"
import { OrganizationRepository } from "../../repositories/OrganizationRepository"

export async function getOrganizationFrom(from: any, withOwner = false): Promise<Organization> {
  const param = (typeof from === 'string') || from.organization

  const repository = getCustomRepository(OrganizationRepository)

  let options: any = validate(param) 
    ? param
    : { where: { id_name: Like(param)  }}

  if (withOwner) {
    options = {
      where: options.where ? options.where : options,
      relations: ['owner']
    }
  }

  const found = await repository.findOne(options)

  return found
}

export async function getOrganizationIdFrom(from: any, forceSearch = true, withOwner = false): Promise<string> {
  const param = (typeof from === 'string') ? from : from.organization

  if (!forceSearch && validate(param)) return param
  
  const found = await getOrganizationFrom(param, withOwner)
  return found && found.id
}

export async function isMember(organizationParam: string, user_id: string, ifOrganizationNotFound?: () => void): Promise<boolean> {
  let organization_id = validate(organizationParam) ? organizationParam : undefined

  const organizationRepository = getCustomRepository(OrganizationRepository)

  const organizationWhere = organization_id 
    ? { id: organization_id } 
    : { name_id: Like(organizationParam) }
    
  const organization = await organizationRepository.findOne(organizationWhere)

  if (!organization && ifOrganizationNotFound) {
    ifOrganizationNotFound()
    return false
  }

  if (organization.owner_id === user_id) return true

  if (!organization_id) organization_id = organization.id

  const memberRepository = getCustomRepository(MemberRepository)

  const member = await memberRepository.findOne({
    organization_id,
    user_id
  })

  if (member) return true

  return false
}
