import { Request, Response } from "express"
import { getCustomRepository } from "typeorm"
import { MemberRepository } from "../repositories/MemberRepository"
import { OrganizationRepository } from "../repositories/OrganizationRepository"

export class OrganizationController {

  async index(request: Request, response: Response) {
    try {
      const { userId: user_id } = request as any

      const organizationRepository = getCustomRepository(OrganizationRepository)

      const organizations = await organizationRepository.find({
        where: { owner_id: user_id },
        relations: ['owner']
      })

      organizations.map((item: any) => {
        item.owner  = {
          name: item.owner.name,
          avatar_url: item.owner.avatar_url 
        }
      })

      const repository = getCustomRepository(MemberRepository)

      const registries = await repository.find({
        where: {
          user_id,
        },
        relations: ['organization'],
      })

      registries.map(item => {
        let organization = item.organization
        organization['role'] = item.role
        organizations.push(organization)
      })

      return response.json(organizations)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async show(request: Request, response: Response) {
    try {
      const { userId: user_id } = request as any
      const { id } = request.params

      const organizationRepository = getCustomRepository(OrganizationRepository)

      const organization: any = await organizationRepository.findOne({
        where: { id },
        relations: ['owner']
      })

      organization.owner = {
        name: organization.owner.name,
        avatar_url: organization.owner.avatar_url,
      }

      const memberRepository = getCustomRepository(MemberRepository)

      const member = await memberRepository.findOne({
        user_id,
        organization_id: id
      })

      if (organization.owner_id!==user_id && !member) {
        return response.status(404).json({ error: 'You not a member of this organization!' })
      }

      organization.role = (member && member.role) ?? 'owner'

      return response.json(organization)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async create(request: Request, response: Response) {
    try {
      const { userId: owner_id } = request as any
      const { name, description, picture_url } = request.body
      let { id_name } = request.body

      if (!name) {
        return response.status(400).json({ error: 'Organization must be a name!' })
      }

      if (!id_name) {
        id_name = String(name).replace(" ","-")
      }

      const repository = getCustomRepository(OrganizationRepository)

      const found = await repository.findOne({
        where: [
          { id_name },
          { name, owner_id },
        ]
      })

      if (found) {
        return response.status(400).json({ error: 'Organization already exists!' })
      }

      const organization = repository.create({
        id_name,
        name,
        description,
        picture_url,
        owner_id,
      })

      await repository.save(organization)

      return response.json(organization)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async destroy(request: Request, response: Response) {
    try {

      const { userId: owner_id } = request as any
      const { id } = request.params
      
      const repository = getCustomRepository(OrganizationRepository)

      const organization = await repository.findOne(id)

      if (!organization) {
        return response.status(404).json({ error: 'Organization not found!' })
      }
      
      if (organization.owner_id !== owner_id) {
        return response.status(404).json({ error: 'You not a owner of organization!' })
      }

      await repository.delete(id)
      
      return response.json({ message: 'Organization successfully deleted!' })
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }
}