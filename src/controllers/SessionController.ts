import { compareSync } from 'bcrypt';
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { getCustomRepository, Like } from "typeorm";
import { authConfig } from "../config/auth";
import { UserRepository } from "../repositories/UserRepository";


export class SessionController {
  
  async create(request: Request, response: Response) {
    try {
      const { login, password } = request.body
      
      const repository = getCustomRepository(UserRepository)
      
      const user: any = await repository.findOne({
        where: {
          login: Like(login)
        }
      })
      
      if (!user) {
        return response.status(401).json({ error: 'Invalid credential' })
      }
      
      const access = compareSync(password, user.password_hash)

      if (!access) {
        return response.status(401).json({ error: 'Invalid credential' })
      }

      const payload = {
        id: user.id
      }

      const token = jwt.sign(payload, authConfig().secret, {
        expiresIn: authConfig().expiresIn,
      })

      response.json(token)
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }
}