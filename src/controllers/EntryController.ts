import { Request, Response } from 'express'
import { getCustomRepository, Like } from 'typeorm'
import { AccountRepository } from '../repositories/AccountRepository'
import { EntryRepository } from '../repositories/EntryRepository'
import { validate } from 'uuid'

export class EntryController {
  async create(request: Request, response: Response) {
    const { expiration: expirationParam, account: accountParam, value, code, payed } = request.body

    if (!accountParam) {
      return response.status(400).json({ error: 'Account not provided!' })
    }

    let expiration_day: number
    if (expirationParam) {
      expiration_day = Number(String(expirationParam).substr(-2))
    }

    const accountRepository = getCustomRepository(AccountRepository)
    
    let account: any
    
    if (validate(accountParam)) {
      account = await accountRepository.findOne(accountParam)
      
      if (!account) {
        return response.status(404).json({ error: 'Account does not exists!' })
      }
    }
    else {
      account = await accountRepository.findOne({ name: Like(accountParam) })

      if (account) {
        if (!expirationParam) {
          expiration_day = account.expiration_day
        }
      }
      else {
        account = accountRepository.create({
          name: accountParam,
          expiration_day,
        })
        await accountRepository.save(account)
      }
    }
    
    const entryRepository = getCustomRepository(EntryRepository)
    
    const date = new Date()
    
    let expiration: string = null

    if (expirationParam && String(expirationParam).indexOf('-')>-1) {
      expiration = expirationParam
    }
    else if (expirationParam !== null) {
      expiration = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(expiration_day ?? date.getDate()).padStart(2,'0')}`
    }

    const entry = await entryRepository.findOne({
      where: [
        { 
          expiration, 
          account_id: account.id 
        },
        { code },
      ],
    })

    if (entry) {
      return response.status(400).json({ error: 'Entry already exists!' })
    }

    const newEntry = entryRepository.create({
      expiration,
      account,
      value,
      code,
      payed,
    })

    await entryRepository.save(newEntry)

    return response.status(201).json(newEntry)
  }

  async index(_: Request, response: Response) {
    const entryRepository = getCustomRepository(EntryRepository)

    const entries = await entryRepository.find({
      relations: ['account'],
    })

    return response.json(entries)
  }

  async destroy(request: Request, response: Response) {
    const { id } = request.body
    const isDeleteAll = id==='all'
    const scope = isDeleteAll ? {} : { id }

    const entryRepository = getCustomRepository(EntryRepository)

    if (isDeleteAll) {
      const count = await entryRepository.findAndCount()
      
      if (count[1] === 0) {
        return response.status(404).json({ error: 'Entries is empty!' })
      }
    }
    else {
      const exists = await entryRepository.findOne(scope)

      if (!exists) {
        return response.status(404).json({ error: 'Entry does not exixts!' })
      }
    }
    
    try {
      await entryRepository.delete(scope)

      return response.json({ 
        message: `${ isDeleteAll ? 'Entries' : 'Entry'} successfully deleted!`
      })
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }
}