import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from 'yup'

import { MemberRepository } from "../repositories/MemberRepository";
import { OrganizationRepository } from "../repositories/OrganizationRepository";


export class MemberController {

  async create(request: Request, response: Response) {
    try {
      const schema = yup.object().shape({
        organization_id: yup.string().uuid().required(),
        user_id: yup.string().uuid().required(),
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
      
      const { organization_id } = data

      const memberRepository = getCustomRepository(MemberRepository)
      
      const userOrganization = await memberRepository.findOne({
        organization_id,
        user_id,
      })

      if (userOrganization) {
        return response.status(401).json({ error: 'The user is already a member of the organization' })
      }
      
      const organizationRepository = getCustomRepository(OrganizationRepository)
      const organizationFound = await organizationRepository.findOne(organization_id)
      if (!organizationFound) {
        return response.status(404).json({ error: 'Organization not found' })
      }
      
      //let role = request.body.role ?? 'participant'
      let { role } = data

      const member = memberRepository.create({
        organization_id,
        user_id,
        role,
      })
      
      await memberRepository.save(member)
      
      return response.json('User successfully adding to the organization')
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async destroy(request: Request, response: Response) {
    try {
      const { userId: meId } = request as any
      const { organization_id, user_id } = request.params
      
      if (!organization_id) {
        return response.status(400).json({ error: 'Organization not provided!' })
      }

      if (!user_id) {
        return response.status(400).json({ error: 'User not provided!' })
      }

      const organizationRepository = getCustomRepository(OrganizationRepository)

      const meIsOrganizationOwner = await organizationRepository.findOne({
        id: organization_id,
        owner_id: meId
      })

      if (meId === user_id && meIsOrganizationOwner) {
        return response.status(400).json({ error: 'You cannot remove yourself from your own organization!' })
      }

      if (meId !== user_id && !meIsOrganizationOwner) {
        return response.status(400).json({ error: 'You cannot remove a member from another organization that you do not own!' })
      }

      const memberRepository = getCustomRepository(MemberRepository)

      const member = await memberRepository.findOne({
        organization_id,
        user_id,
      })

      if (!member) {
        return response.status(404).json({ error: 'Member not found!' })
      }

      await memberRepository.delete({
        organization_id,
        user_id,
      })

      return response.json({ message: 'Member successfully deleted!' })
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }
}