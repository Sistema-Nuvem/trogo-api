import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup';
import { MemberRepository } from "../repositories/MemberRepository";
import { getMemberWithOrganization } from "./util/member";
import { getOrganizationFrom, getOrganizationIdFrom } from "./util/organization";

const validatorUUID = yup.string().uuid().required()
const validatorRouterParamOrganization = yup.string().required().label('roter param organization')
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
        validatorRouterParamOrganization.validateSync(request.params.organization)
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

      const organization_id = await getOrganizationIdFrom(request.params)
      if (!organization_id) {
        return response.status(404).json({ error: 'Organization not found!' })
      }

      const memberRepository = getCustomRepository(MemberRepository)
      
      const userOrganization = await memberRepository.findOne({
        organization_id,
        user_id,
      })

      if (userOrganization) {
        return response.status(401).json({ error: 'The user is already a member of the organization' })
      }
      
      //let role = request.body.role ?? 'participant'
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

  async update(request: Request, response: Response) {
    try {
      const schema = yup.object().shape({
        role: yup.string().oneOf([
          'collaborator',
          'admin',
        ])
      })

      const { organization: organization_param, id } = request.params

      try {
        validatorRouterParamOrganization.validateSync(organization_param)
        validatorRouterParamMember.validateSync(id)
        schema.validateSync(request.body)
      }
      catch (error) {
        return response.status(400).json({ error: error.message })
      }

      const organization_id = await getOrganizationIdFrom(request.params)
      console.log('organization_id: ', organization_id)
      if (!organization_id) {
        return response.status(404).json({ error: 'Organization not found!' })
      }

      const repository = getCustomRepository(MemberRepository)
            
      const member = await repository.findOne({
        where: { id, organization_id },
        relations: ['organization', 'user'],
      })
      
      console.log('member: ', member)

      if (!member) {
        return response.status(404).json({ error: 'Member not found in that organization!' })
      }
      
      const { userId } = request as any
      if (member.organization.owner_id !== userId) {
        return response.status(401).json({ error: 'You cannot modify a member of an organization in which you are not the owner!' })
      }
      
      member.role = request.body.role
      member.user.password_hash = undefined

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

      const { entity: member, repository} = await getMemberWithOrganization(id)
    
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