import { Request, Response } from 'express'
import { getCustomRepository, Like, Not } from 'typeorm'
import { validate } from 'uuid'
import * as yup from 'yup'

import { schemaConfig } from '../config/schema'

import { AccountRepository } from '../repositories/AccountRepository'
import { EntryRepository } from '../repositories/EntryRepository'
import { momentDate } from '../validations/momentDate'

export class EntryController {
  async create(request: Request, response: Response) {
    try {
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
          return response.status(404).json({ error: 'Account does not exist!' })
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
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async index(_: Request, response: Response) {
    try {
      const entryRepository = getCustomRepository(EntryRepository)
      
      const entries = await entryRepository.find({
        relations: ['account'],
      })
      
      return response.json(entries)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async show(request: Request, response: Response) {
    try {
      const { id } = request.params

      if (!id) {
        return response.status(400).json({ error: 'Entry not provided!' })
      }

      const entryRepository = getCustomRepository(EntryRepository)
      
      const entry = await entryRepository.findOne({
        where: { id },
        relations: ['account'],
      })

      if (!entry) {
        return response.status(404).json({ error: 'Entry not found!' })
      }
      
      return response.json(entry)
    }
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async update(request: Request, response: Response) {
    try {
      const { id } = request.params

      const schema = yup.object().shape({
        account_id: yup.string().uuid(),
        expiration: momentDate(),
        value: yup.number().nullable(),
        code: yup.string().nullable(),
        payed: yup.boolean(),
      }).noUnknown()
      
      try {
        yup.string().uuid().validateSync(id)

        schema.validateSync(request.body, schemaConfig)
      }
      catch (error) {
        return response.status(400).json({ error: error.message })
      }

      const repository = getCustomRepository(EntryRepository)

      const entry: any = await repository.findOne({ id })

      if (!entry) {
        return response.status(404).json({ error: 'Entry not found' })
      }
      
      const { account_id } = request.body
      
      if (account_id) {
        const accountRepository = getCustomRepository(AccountRepository)
        
        const accountExists = await accountRepository.findOne({ id: account_id })

        if (!accountExists) {
          return response.status(404).json({ error: 'Account does not exist!' })
        }
      }
      
      const { code } = request.body
      
      if (code) {
        const sameCode = await repository.findOne({
          id: Not(id), 
          code,
        })
        if (sameCode) {
          return response.status(400).json({ error: 'There is already a entry with the same digitizable line!' })
        }
      }

      const { expiration } = request.body

      if (expiration) {
        const sameExpiration = await repository.findOne({
          id: Not(id),
          account_id: account_id || entry.account_id,
          expiration,
        })
        if (sameExpiration) {
          return response.status(400).json({ error: 'There is already a release of this account with the same expiration date!' })
        }
      }

      for (const field in request.body) {
        entry[field] = request.body[field]
      }

      await repository.update({ id }, entry)

      return response.json(entry)
    }
    catch(error) {
      return response.status(500).json({ error: error.message })
    }
  }

  async destroy(request: Request, response: Response) {
    const { id } = request.params

    const isDeleteAll = id === undefined
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
    catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }
}