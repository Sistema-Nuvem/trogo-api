import { Request, Response } from "express"
import { unlinkSync, existsSync } from 'fs'
import { getCustomRepository, Like, Not } from "typeorm"
import * as yup from 'yup'

import { schemaConfig } from "../config/schema"
import { myNoUnknownTest } from "../validations/myNoUnknownTest"
import { createConnectionOrganization } from '../database/organization'

import { UserRepository } from "../repositories/UserRepository"
import { OrganizationRepository } from "../repositories/OrganizationRepository"
import { MemberRepository } from "../repositories/MemberRepository"

const validatorRouterParamId = yup.string()
  .uuid()
  .required()
  .label('router param organization')
  .test({
    message: 'Organization not found!',
    test: async (value, context) => {
      const repository = getCustomRepository(OrganizationRepository)
      const entity = await repository.findOne(value)
      context['repository'] = repository
      context['entity'] = entity
      return Boolean(entity)
    }
  })

const validatorRouterParamIdOwner = validatorRouterParamId
  .test({
    message: 'You are not the owner of the organization!',
    test: async (value, context) => {
      const { userId: owner_id } = context.schema
      const repository = getCustomRepository(OrganizationRepository)
      const found = await repository.findOne({
        id: value,
        owner_id
      })
      return Boolean(found)
    }
  })

  const validatorRouterParamIdMember = validatorRouterParamId
  .test({
    message: 'You are not the member of the organization!',
    test: async (value, context) => {
      const { userId } = context.schema

      const organizationRepository = getCustomRepository(OrganizationRepository)
      const organizationFound = await organizationRepository.findOne({
        id: value,
        owner_id: userId
      })
      if (Boolean(organizationFound)) return true

      const memberRepository = getCustomRepository(MemberRepository)
      const memberFound = await memberRepository.findOne({
        organization_id: value,
        user_id: userId
      })
      return Boolean(memberFound)
    }
  })

  const validatorUniqueText = yup.string().min(1).test({
    message: '${path} alredy exist!',
    test: async (value, context: yup.TestContext) => {
      const { organizationId } = context.schema
      const repository = getCustomRepository(OrganizationRepository)
      let options: any = {}
      if (organizationId) {
        options.id = Not(organizationId)
      }
      options[`${context.path}`] = Like(value)
      const found = await repository.findOne(options)
      return !Boolean(found)
    }
  })

  const validatorOwnerId = yup.string().uuid().test({
    message: '${path} not found in users!',
    test: async value => {
      const repository = getCustomRepository(UserRepository)
      const entity = await repository.findOne(value)
      return Boolean(entity)
    }
  })

export class OrganizationController {

  async create(request: Request, response: Response) {
    try {
      const { name: nameOriginalValue } = request.body
      const defaultIdName = nameOriginalValue ? String(nameOriginalValue).replace(" ","-") : null
      const { userId: owner_id } = request as any

      const schema = yup.object().shape({
        name: validatorUniqueText.required(),
        id_name: validatorUniqueText.required().default(defaultIdName),
        owner_id: validatorOwnerId.required().default(owner_id),
        description: yup.string().nullable(),
        picture_url: yup.string().url().min(9).nullable(),
        active: yup.boolean().default(true),
      }).noUnknown().test(myNoUnknownTest)

      schema.fields.name['organizationId'] = null
      schema.fields.id_name['organizationId'] = null

      try {
        await schema.validate(request.body, schemaConfig)
      }
      catch (error) {
        return response.status(400).json({ error: error.message })
      }

      const data: any = schema.cast(request.body) 

      const { name } = data

      const repository = getCustomRepository(OrganizationRepository)

      const found = await repository.findOne({ 
        name: Like(name), 
        owner_id 
      })

      if (found) {
        return response.status(400).json({ error: 'Organization already exists!' })
      }

      const organization: any = repository.create(data)

      await repository.save(organization)

      const connection = await createConnectionOrganization(organization.id)
      await connection.runMigrations()

      return response.json(organization)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async update(request: Request, response: Response) {
    try {
      const { id } = request.params
      
      const schema = yup.object().shape({
        name: validatorUniqueText,
        id_name: validatorUniqueText,
        owner_id: validatorOwnerId,
        description: yup.string().nullable(),
        picture_url: yup.string().url().min(9).nullable(),
        active: yup.boolean(),
      }).noUnknown().test(myNoUnknownTest)

      const { userId } = request as any
      validatorRouterParamIdOwner['userId'] = userId
      schema.fields.name['organizationId'] = id
      schema.fields.id_name['organizationId'] = id

      try {
        await validatorRouterParamIdOwner.validate(id)
        await schema.validate(request.body, schemaConfig)
      }
      catch (error) {
        return response.status(400).json({ error: error.message })
      }

      const repository = getCustomRepository(OrganizationRepository)

      const entity = await repository.findOne(id)

      const data = schema.cast(request.body)
      for (const field in data) {
        entity[field] = data[field]
      }

      await repository.save(entity)
      
      return response.json(entity)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async index(request: Request, response: Response) {
    try {
      const { userId: user_id } = request as any

      const organizationRepository = getCustomRepository(OrganizationRepository)

      const organizations: any = await organizationRepository.find({
        where: { owner_id: user_id },
        relations: ['owner']
      })

      const memberRepository = getCustomRepository(MemberRepository)

      for (const item of organizations) {
        const members = await memberRepository.find({
          where: { organization_id: item.id },
          relations: ['user'],
        })

        item.members = members.map(item => ({
          id: item.id,
          role: item.role,
          user: {
            id: item.user.id,
            name: item.user.name,
            avatar_url: item.user.avatar_url,
          }
        }))
      }

      return response.json({ organizations })
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async show(request: Request, response: Response) {
    try {
      const { userId: user_id } = request as any
      const { id } = request.params
      
      validatorRouterParamIdMember['userId'] = user_id

      try {
        await validatorRouterParamIdMember.validate(id)
      }
      catch (error) {
        return response.status(400).json({ error: error.message })
      }
      
      const organizationRepository = getCustomRepository(OrganizationRepository)
      
      const organization: any = await organizationRepository.findOne({
        where: { id },
        relations: ['owner'],
      })

      organization.owner = {
        name: organization.owner.name,
        avatar_url: organization.owner.avatar_url,
      }

      const memberRepository = getCustomRepository(MemberRepository)
      const members = await memberRepository.find({
        where: { organization_id: id },
        relations: ['user'],
      })

      organization.members = members.map(item => ({
        id: item.id,
        role: item.role,
        user: {
          id: item.user.id,
          name: item.user.name,
          avatar_url: item.user.avatar_url
        }
      }))

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

      validatorRouterParamIdOwner['userId'] = owner_id

      try {
        await validatorRouterParamIdOwner.validate(id)
      }
      catch (error) {
        return response.status(400).json({ error: error.message })
      }

      const repository = getCustomRepository(OrganizationRepository)
    

      try {
        const connectionOrganization = await createConnectionOrganization(id)
        if (connectionOrganization) {
          const database = connectionOrganization.options.database as string

          try {
            if (!connectionOrganization.isConnected) {
              await connectionOrganization.connect()
            }

            try {
              await connectionOrganization.dropDatabase()
            }
            catch (error) {
              console.log(`error on drop database: '${database}': `, error.message)
            }

            try {
              await connectionOrganization.close()
            }
            catch (error) {
              console.log(`error on close database: '${database}': `, error.message)
            }
          }
          catch (error) {
            console.log(`error on connect to database: '${database}': `, error.message)
          }

          try {
            if (existsSync(database)) {
              unlinkSync(database)
            }
          }
          catch (error) {
            console.log(`error on delete database file: '${database}': `, error.message)
          }
        }
      }
      catch (error) {
        console.log(`error on get connection to organization database: `, error.message)
      }

      await repository.delete(id)
      
      return response.json({ message: 'Organization successfully deleted!' })
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }
}