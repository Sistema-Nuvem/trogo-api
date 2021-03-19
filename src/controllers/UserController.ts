import { Request, Response } from "express";
import { getCustomRepository, Not } from "typeorm";
import { hashSync } from 'bcrypt';
import * as yup from 'yup'

import { UserRepository } from "../repositories/UserRepository";
import { myNoUnknownTest } from "../validations/myNoUnknownTest";
import { noEmptyTest } from "../validations/noEmptyTest";
import { passwordConfig } from "../config/password";

export class UserControler {

  async create(request: Request, response: Response) {
    try {
      const schema = yup.object().shape({
        email: yup.string().email().min(5).required(),
        login: yup.string().min(1).required(), 
        name: yup.string().min(1).nullable(),
        avatar_url: yup.string().url().min(9).nullable(),
        password: yup.string().required().matches(
          passwordConfig().regex, 
          passwordConfig().instructions
        ),
      })

      try {
        schema.validateSync(request.body)
      }
      catch (error) {
        return response.status(401).json({ error: error.message })
      }

      const data: any = schema.cast(request.body)

      const { login, password, email } = data
      
      const repository = getCustomRepository(UserRepository)

      const sameLogin = await repository.findOne({ login })
      if (sameLogin) {
        return response.status(401).json({ error: 'There is already a user with the same login!' })
      }

      const sameEmail = await repository.findOne({ email })
      if (sameEmail) {
        return response.status(401).json({ error: 'There is already a user with the same email!' })
      }
      
      data.password_hash = hashSync(password, 8)
      
      const user: any = repository.create(data)
      
      await repository.save(user)
      
      user.password_hash = undefined
      
      return response.json(user)
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async show(request: Request, response: Response) {
    try {
      const { userId } = request as any
      const { id } = request.params

      if (!id) {
        return response.status(400).json({ error: 'User not provided!' })
      }

      if (userId !== id) {
        return response.status(401).json({ error: 'Access denied!' })
      }

      const repository = getCustomRepository(UserRepository)
      
      const user = await repository.findOne(userId)
      
      if (!user) {
        return response.status(404).json({ error: 'User not found!' })
      }
      
      user.password_hash = undefined
      
      return response.json(user)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async update(request: Request, response: Response) {
    try {
      const { id } = request.params
      const { userId } = request as any
      if (userId !== id) {
        return response.status(401).json({ error: 'Access denied!' })
      }

      const schema = yup.object().shape({
        name: yup.string().min(1).nullable(),
        email: yup.string().email().min(5).nullable(),
        avatar_url: yup.string().url().min(9).nullable(),
        login: yup.string().min(1),
        plataform: yup.string().min(1).nullable(),
        active: yup.boolean(),
      }).noUnknown().test(myNoUnknownTest).test(noEmptyTest)

      try {
        schema.validateSync(request.body)
      }
      catch (error) {
        return response.status(400).json({ error: error.message })
      }

      const data = schema.cast(request.body)

      const repository = getCustomRepository(UserRepository)
      const user = await repository.findOne({ id })
      if (!user) {
        return response.status(404).json({ error: 'User not found!' })
      }
      
      const { login } = data
      const sameLogin = await repository.findOne({
        id: Not(id),
        login,
      })
      if (sameLogin) {
        return response.status(400).json({ error: 'There is already a user with the same login!' })
      }

      const { email } = data
      const sameEmail = await repository.findOne({
        id: Not(id),
        email,
      })
      if (sameEmail) {
        return response.status(400).json({ error: 'There is already a user with the same email!' })
      }

      user.password_hash = undefined

      await repository.update({ id }, data)

      return response.json(data)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async destroy(request: Request, response: Response) {
    try {
      const { userId } = request as any
      const { id } = request.params

      if (!id) {
        return response.status(400).json({ error: 'User not provided!' })
      }

      if (userId !== id) {
        return response.status(401).json({ error: 'Access denied!' })
      }

      const repository = getCustomRepository(UserRepository)

      const exists = await repository.findOne(userId)

      if (!exists) {
        return response.status(404).json({ error: 'User does not exixts!' })
      }
    
      await repository.delete(userId)

      return response.json({ 
        message: 'Users successfully deleted!'
      })
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }

}