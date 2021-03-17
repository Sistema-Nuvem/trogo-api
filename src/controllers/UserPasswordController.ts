import { compareSync, hashSync } from "bcrypt"
import { Request, Response } from "express"
import { getCustomRepository } from "typeorm"
import { UserRepository } from "../repositories/UserRepository"

export class UserPasswordController {
  async update(request: Request, response: Response) {
    try {

      const { userId } = request as any
      const { id } = request.params
      
      if (!id) {
        return response.status(400).json({ error: 'User not provieded!' })
      }
      
      if (userId !== id) {
        return response.status(401).json({ error: 'Access denied!' })
      }
      
      const { password, password_new, password_confirm } = request.body
      
      if (!password) {
        return response.status(400).json({ error: 'Password not provided!' })
      }
      
      if (!password_new) {
        return response.status(400).json({ error: 'New password not provided!' })
      }
      
      if (password === password_new) {
        return response.status(400).json({ error: 'The new password must be different from the current one!' })
      }
      
      if (password_new !== password_confirm) {
        return response.status(400).json({ error: 'New and confirm password not math!' })
      }
      
      const repository = getCustomRepository(UserRepository)
      
      const user = await repository.findOne(userId)
      
      const math = compareSync(password, user.password_hash)
      
      if (!math) {
        return response.status(401).json({ error: 'Password not math!' })
      }
      
      user.password_hash = hashSync(password_new, 8)
      
      await repository.save(user)
      
      return response.json({ message: 'Password successfully change!' })
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }
}