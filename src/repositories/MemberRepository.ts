import { EntityRepository, FindManyOptions, FindOneOptions, getCustomRepository, Like, ObjectLiteral, Repository } from "typeorm";
import { validate } from "uuid";
import { Member } from "../models/Member";
import { OrganizationRepository } from "./OrganizationRepository";

interface GetListResult {
  organization_id: string
  items: Member[]
}

@EntityRepository(Member)
export class MemberRepository extends Repository<Member> {

  async isMember(organizationParam: string, user_id: string, ifOrganizationNotFound?: () => void): Promise<boolean> {
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

  async getList(organization_id: string, withUsers: boolean | [] = false): Promise<GetListResult> {
    
    let options: ObjectLiteral | FindManyOptions = {
      organization_id,
    } 
    
    if (withUsers) {
      options = {
        where: options,
        relations: ['user'],
      }
    }
    
    const items = await this.find(options)
    if (items) {
      items.map(async (item: any) => {
        item.organization_id = undefined
        if (withUsers instanceof Array) {
          let user: any = {} 
          for (const field of withUsers) {
            user[field] = item.user[field]
          }
          item.user = user
        }
      })
    }
    
    return {
      organization_id,
      items,
    }
  }
}