import { Request, Response } from "express"
import { Router } from 'express'

import { AccountController } from './controllers/AccountController'
import { EntryController } from './controllers/EntryController'

export const router = Router()

const accountController = new AccountController()
const entryController = new EntryController()

router.get('/', (_: Request, res: Response) => {
  res.send('Olá Trogo!')
})

router.get('/accounts', accountController.index)
router.post('/accounts', accountController.create)
router.delete('/accounts', accountController.destroy)

router.get('/entries', entryController.index)
router.post('/entries', entryController.create)
router.delete('/entries', entryController.destroy)
