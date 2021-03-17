import { Request, Response } from "express"
import { getCustomRepository } from "typeorm"
import { AccountRepository } from "../repositories/AccountRepository"

export class AccountController {

  async create(req: Request, res: Response) {
    try {
      const { name, expiration_day, active } = req.body

      const accountRepository = getCustomRepository(AccountRepository)

      const account = await accountRepository.findOne({
        name
      })

      if (account) {
        return res.status(400).json({
          error: 'Account already exists!'
        })
      }

      const newAccount = accountRepository.create({
        name,
        expiration_day,
        active: active ?? true
      })

      await accountRepository.save(newAccount)

      return res.status(201).json(newAccount)
    }
    catch(error) {
      return res.status(500).json(error)
    }
  }

  async index(_: Request, response: Response) {
    const repository = getCustomRepository(AccountRepository)

    const registries = await repository.find()

    return response.json(registries)
  }

  async destroy(request: Request, response: Response) {
    const { id } = request.body
    const isDeleteAll = id==='all'
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