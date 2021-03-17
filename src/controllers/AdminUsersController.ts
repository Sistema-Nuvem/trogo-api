import { Request, Response } from "express"
import { getCustomRepository } from "typeorm"
import { UserRepository } from "../repositories/UserRepository"

export class AdminUsersController {

  async index(_: Request, response: Response) {
    try {
      const repository = getCustomRepository(UserRepository)
      
      const all = await repository.find()

      all.map(item => item.password_hash = undefined)
      
      return response.json(all)
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async destroy(request: Request, response: Response) {
    const { id } = request.body

    if (!id) {
      return response.status(400).json({ error: 'User not provided!' })
    }

    const isDeleteAll = id==='all'
    const scope = isDeleteAll ? {} : { id }

    const repository = getCustomRepository(UserRepository)

    if (isDeleteAll) {
      const count = await repository.findAndCount()
      
      if (count[1] === 0) {
        return response.status(404).json({ error: 'Users is empty!' })
      }
    }
    else {
      const exists = await repository.findOne(scope)

      if (!exists) {
        return response.status(404).json({ error: 'User does not exixts!' })
      }
    }
    
    try {
      await repository.delete(scope)

      return response.json({ 
        message: `${ isDeleteAll ? 'Users' : 'User'} successfully deleted!`
      })
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }
}