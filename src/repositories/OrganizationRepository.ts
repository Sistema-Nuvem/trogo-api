import { EntityRepository, getCustomRepository, Like, Repository } from "typeorm";
import { validate } from "uuid";
import { Organization } from "../models/Organization";

@EntityRepository(Organization)
export class OrganizationRepository extends Repository<Organization> {

  async getFrom(from: any, withOwner = false): Promise<Organization> {
    const param = (typeof from === 'string') || from.organization
  
    let options: any = validate(param) 
      ? { id: param }
      : { where: { id_name: Like(param)  }}
  
    if (withOwner) {
      options = {
        where: options.where ? options.where : options,
        relations: ['owner']
      }
    }
  
    const found = await this.findOne(options)
  
    return found
  }
  
  async getIdFrom(from: any, forceSearch = true, withOwner = false): Promise<string> {
    const param = (typeof from === 'string') ? from : from.organization
  
    if (!forceSearch && validate(param)) return param
    
    const found = await this.getFrom(param, withOwner)
    return found && found.id
  }
}