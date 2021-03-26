import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup';
import { schemaConfig } from "../config/schema";
import { MemberRepository } from "../repositories/MemberRepository";
import { OrganizationRepository } from "../repositories/OrganizationRepository";
import { UserRepository } from "../repositories/UserRepository";
import { myNoUnknownTest } from "../validations/myNoUnknownTest";

const validatorUUID = yup.string().uuid().required()
const validatorRouterParamMember = validatorUUID.label('router param member id')

export class MemberController {

  async create(request: Request, response: Response) {
    try {
      const schema = yup.object().shape({
        user_id: validatorUUID,
        role: yup.string().nullable().oneOf([
          'collaborator',
          'admin',
        ]).default('collaborator')
      }).noUnknown().test(myNoUnknownTest)

      try {
        schema.validateSync(request.body, schemaConfig)
      }
      catch (error) {
        return response.status(500).json({ error: error.message })
      }

      const data = schema.cast(request.body)

      const { user_id } = data
      const { userId } = request as any
      
      if (userId === user_id) {
        return response.status(401).json({ error: 'You cannot add yourself to other organizations or you are already added to your own organization!' })
      }
      
      const userRepository = getCustomRepository(UserRepository)
      const userFound = await userRepository.findOne(user_id)
      if (!userFound) {
        return response.status(404).json({ error: 'User not found!' })
      }
      userFound.password_hash = undefined

      const { organizationId: organization_id } = request as any

      const memberRepository = getCustomRepository(MemberRepository)
      
      const userOrganization = await memberRepository.findOne({
        organization_id,
        user_id,
      })

      if (userOrganization) {
        return response.status(401).json({ error: 'The user is already a member of the organization' })
      }
      
      let { role } = data

      const member = memberRepository.create({
        organization_id,
        user_id,
        role,
      })

      await memberRepository.save(member)
      
      return response.json(member)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async index(request: Request, response: Response) {
    try {
      const { organization } = request as any

      const userFields: any = [
        'id', 
        'login', 
        'name', 
        'avatar_url', 
        'active'
      ] 

      const repository = getCustomRepository(MemberRepository)
      
      const members = await repository.getList(organization.id, userFields)

      let ownerFields = {}
      userFields.map((item: string) => ownerFields[item] = organization.owner[item])

      Object(members.items).unshift({
        id: 'onwer',
        role: 'owner',
        created_at: organization.created_at,
        user: ownerFields,
      })

      const membersItems = members.items.map(item => ({
        id: item.id,
        role: item.role,
        created_at: item.created_at,
        user: item.user,
      }))

      const result: any = {
        organization: {
          id: organization.id,
          id_name: organization.id_name,
          name: organization.name,
          picture_url: organization.picture_url,
          active: organization.active,
          owner_id: organization.owner_id,
        },
        members: membersItems,
      }

      return response.json(result)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async view(request: Request, response: Response) {
    try {
      const { organizationId, ownerId, organization } = request as any

      const { id } = request.params

      let memberFound: any

      if (id !== 'owner') {
        const memberRepository = getCustomRepository(MemberRepository)
        memberFound = await memberRepository.findOne({
          where: { id },
          relations: ['user']
        })

        if (!memberFound) {
          return response.status(404).json({ error: 'Member not found!' })
        }

        if (memberFound.organization_id !== organizationId) {
          return response.status(404).json({ error: 'This member is not in that organization!' })
        }
      }

      const userFields: any = [
        'id', 
        'login', 
        'name', 
        'avatar_url', 
        'active'
      ] 

      let user: any

      if (memberFound && ownerId !== memberFound.user_id) {
        user = {}
        for (const field of userFields) {
          user[field] = memberFound.user[field]
        }
      }
      let owner = {}
      userFields.map((item: string) => owner[item] = organization.owner[item])

      const result: any = {
        id: id,
        role: memberFound ? memberFound.role : 'owner',
        user: memberFound ? user : owner,
        organization: {
          id: organization.id,
          id_name: organization.id_name,
          name: organization.name,
          picture_url: organization.picture_url,
          active: organization.active,
          owner: memberFound ? owner : undefined,
        },
      }

      return response.json(result)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async update(request: Request, response: Response) {
    try {
      const schema = yup.object().shape({
        role: yup.string().oneOf([
          'collaborator',
          'admin',
        ]).required()
      }).noUnknown().test(myNoUnknownTest)

      const { id } = request.params

      try {
        validatorRouterParamMember.validateSync(id)
        schema.validateSync(request.body, schemaConfig)
      }
      catch (error) {
        return response.status(400).json({ error: error.message })
      }

      const { organizationId: organization_id } = request as any

      const repository = getCustomRepository(MemberRepository)
            
      const member = await repository.findOne({
        where: { id, organization_id },
      })
      
      if (!member) {
        return response.status(404).json({ error: 'Member not found in that organization!' })
      }
      
      member.role = request.body.role

      await repository.update(id, {
        role: member.role
      })
      
      return response.json(member)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async destroy(request: Request, response: Response) {
    try {
      const { id } = request.params

      const repository = getCustomRepository(MemberRepository)
      
      const member = await repository.findOne({
        where: { id },
        relations: ['organization']
      })
    
      if (!member) {
        return response.status(404).json({ error: 'Member not found!' })
      }

      const { userId: meId } = request as any
      if (meId !== member.user_id && meId !== member.organization.owner_id) {
        return response.status(404).json({ error: 'Access denied!' })
      }

      const organization = await getCustomRepository(OrganizationRepository).getFrom(request.params)
      if (!organization) {
        return response.status(400).json({ error: 'Organization not found!' })
      }
      const { id: organization_id } = organization
      if (member.organization_id !== organization_id) {
        return response.status(404).json({ error: 'Member not found in that organization!' })
      }

      await repository.delete(id)

      return response.json({ message: 'Member successfully deleted!' })
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }
}