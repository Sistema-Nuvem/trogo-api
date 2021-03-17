import { Request, Response } from "express"
import { Router } from 'express'

import authMiddleware from './middlewares/auth'
import adminMiddleware from './middlewares/admin'

import { AccountController } from './controllers/AccountController'
import { EntryController } from './controllers/EntryController'
import { SessionController } from "./controllers/SessionController"
import { UserControler } from "./controllers/UserController"
import { UserPasswordController } from "./controllers/UserPasswordController"
import { AdminUsersController } from "./controllers/AdminUsersController"

export const router = Router()

const sessionController = new SessionController()
const userController = new UserControler()
const adminUsersController = new AdminUsersController()
const userPasswordController = new UserPasswordController()
const accountController = new AccountController()
const entryController = new EntryController()

router.get('/', (_: Request, response: Response) => {
  response.send('<h1>Trogo API</h1>')
})

router.post('/users', userController.create)
router.post('/sessions', sessionController.create)

router.use(authMiddleware)

router.put('/users/password/:id', userPasswordController.update)

router.get('/users/:id', userController.show)
router.delete('/users/:id', userController.destroy)

router.get('/accounts', accountController.index)
router.get('/accounts/:id', accountController.show)
router.post('/accounts', accountController.create)
router.delete('/accounts/:id', accountController.destroy)

router.get('/entries', entryController.index)
router.get('/entries/:id', entryController.show)
router.post('/entries', entryController.create)
router.delete('/entries/:id', entryController.destroy)

router.use(adminMiddleware)

router.delete('/accounts', accountController.destroy)
router.delete('/entries', entryController.destroy)

router.get('/admin/users', adminUsersController.index)
router.delete('/admin/users/:id', adminUsersController.destroy)
router.delete('/admin/users', adminUsersController.destroy)
