import { Request, Response } from "express"
import { getCustomRepository } from "typeorm"
import { AccountRepository } from "../repositories/AccountRepository"

export class AccountController {

  async index(_: Request, response: Response) {
    try {
      const repository = getCustomRepository(AccountRepository)
      
      const registries = await repository.find()
      
      return response.json(registries)
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async show(request: Request, response: Response) {
    try {
      const { id } = request.params

      if (!id) {
        return response.status(500).json({ error: 'Account not provided!' })
      }

      const repository = getCustomRepository(AccountRepository)
      
      const registry = await repository.findOne(id)

      if (!registry) {
        return response.status(500).json({ error: 'Account not found!' })
      }
      
      return response.json(registry)
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async create(request: Request, response: Response) {
    try {
      const { name, expiration_day, active } = request.body

      const accountRepository = getCustomRepository(AccountRepository)

      const account = await accountRepository.findOne({
        name
      })

      if (account) {
        return response.status(400).json({
          error: 'Account already exists!'
        })
      }

      const newAccount = accountRepository.create({
        name,
        expiration_day,
        active: active ?? true
      })

      await accountRepository.save(newAccount)

      return response.status(201).json(newAccount)
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async destroy(request: Request, response: Response) {
    const { id } = request.params

    const isDeleteAll = id === undefined

    const scope = isDeleteAll ? {} : { id }

    const repository = getCustomRepository(AccountRepository)

    if (isDeleteAll) {
      const count = await repository.findAndCount()
      
      if (count[1] === 0) {
        return response.status(404).json({ error: 'Accounts is empty!' })
      }
    }
    else {
      const exists = await repository.findOne(scope)

      if (!exists) {
        return response.status(404).json({ error: 'Account does not exixts!' })
      }
    }
    
    try {
      await repository.delete(scope)

      return response.json({ 
        message: `${ isDeleteAll ? 'Accounts' : 'Account'} and all your entries successfully deleted!`
      })
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }
}