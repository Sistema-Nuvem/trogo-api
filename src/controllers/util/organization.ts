import { getCustomRepository, Like } from "typeorm"
import { validate } from "uuid"
import { Organization } from "../../models/Organization"
import { OrganizationRepository } from "../../repositories/OrganizationRepository"

export async function getOrganizationFrom(from: any): Promise<Organization> {
  const param = (typeof from === 'string') || from.organization

  const repository = getCustomRepository(OrganizationRepository)

  const key: any = validate(param) 
    ? param
    : { where: { id_name: Like(param)  }}

  const found = await repository.findOne(key)

  return found
}

export async function getOrganizationIdFrom(from: any, forceSearch = true) {
  const param = (typeof from === 'string') ? from : from.organization

  if (!forceSearch && validate(param)) return param
  
  const found = await getOrganizationFrom(param)
  return found && found.id
}
