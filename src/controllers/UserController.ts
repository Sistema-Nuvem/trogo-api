import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { hashSync } from 'bcrypt';

import { UserRepository } from "../repositories/UserRepository";

export class UserControler {

  async create(request: Request, response: Response) {
    try {
      const { login, name, avatar_url, password, email } = request.body
      
      const repository = getCustomRepository(UserRepository)
      
      const password_hash = hashSync(password, 8)
      
      const user = repository.create({
        login,
        name,
        avatar_url,
        password_hash,
        email,
      })
      
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