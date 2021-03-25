import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup';
import { MemberRepository } from "../repositories/MemberRepository";
import { UserRepository } from "../repositories/UserRepository";
import { getMembersList, getMemberWithOrganization } from "./util/member";
import { getOrganizationFrom } from "./util/organization";

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
      })

      try {
        schema.validateSync(request.body)
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
      console.log('member: ', member)
      
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

      const { members } = await getMembersList(organization.id, userFields)

      let ownerFields = {}
      userFields.map((item: string) => ownerFields[item] = organization.owner[item])

      Object(members.items).unshift({
        id: 'onwer',
        role: 'owner',
        created_at: organization.created_at,
        user: ownerFields,
      })

      const result: any = {
        organization: {
          id: organization.id,
          id_name: organization.id_name,
          name: organization.name,
          picture_url: organization.picture_url,
          active: organization.active,
          owner_id: organization.owner_id,
        },
        members: members.items,
      }

      return response.json(result)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async view(request: Request, response: Response) {
    try {
      const { userId, organizationId, ownerId, organization } = request as any

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
      console.log('organization: ', organization)
      console.log('userFields: ', userFields)
      let owner = {}
      userFields.map((item: string) => owner[item] = organization.owner[item])

      console.log('owner: ', owner)

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
        ])
      })

      const { id } = request.params

      try {
        validatorRouterParamMember.validateSync(id)
        schema.validateSync(request.body)
      }
      catch (error) {
        return response.status(400).json({ error: error.message })
      }

      const { organizationId: organization_id } = request as any

      const repository = getCustomRepository(MemberRepository)
            
      const member = await repository.findOne({
        where: { id, organization_id },
      })
      
      console.log('member: ', member)

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

      const { member, repository} = await getMemberWithOrganization(id)
    
      if (!member) {
        return response.status(404).json({ error: 'Member not found!' })
      }

      const { userId: meId } = request as any
      if (meId !== member.user_id && meId !== member.organization.owner_id) {
        return response.status(404).json({ error: 'Access denied!' })
      }

      const organization = await getOrganizationFrom(request.params)
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