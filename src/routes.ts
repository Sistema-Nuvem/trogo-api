import { Request, Response, Router } from "express"

import { UserControler } from "./controllers/UserController"
import { SessionController } from "./controllers/SessionController"
import { UserPasswordController } from "./controllers/UserPasswordController"
import { OrganizationController } from "./controllers/OrganizationController"
import { MemberController } from "./controllers/MemberController"
import { AccountController } from './controllers/AccountController'
import { EntryController } from './controllers/EntryController'
//import { AdminUsersController } from "./controllers/AdminUsersController"

import connectionsMiddleware from './middlewares/connections'
import authMiddleware from './middlewares/auth'
import organizationMiddleware from './middlewares/organization'
import ownerMiddleware from './middlewares/owner'
import memberMiddleware from './middlewares/member'
import connectionOrganizationMiddleware from './middlewares/connectionOrganization'
//import adminMiddleware from './middlewares/admin'

export const router = Router()

const userController = new UserControler()
const sessionController = new SessionController()
const userPasswordController = new UserPasswordController()
const organizationController = new OrganizationController()
const memberController = new MemberController()
const entryController = new EntryController()
const accountController = new AccountController()
//const adminUsersController = new AdminUsersController()


router.get('/', (_: Request, response: Response) => {
  response.send('<h1>Trogo API</h1>')
})

router.use(connectionsMiddleware)

router.post('/users', userController.create)
router.post('/sessions', sessionController.create)

router.use(authMiddleware)

router.put('/users/password/:id', userPasswordController.update)

router.get('/users/:id', userController.show)
router.put('/users/:id', userController.update)
router.delete('/users/:id', userController.destroy)

router.post('/organizations', organizationController.create)
router.get('/organizations', organizationController.index)
router.get('/organizations/:id', organizationController.show)
router.put('/organizations/:id', organizationController.update)
router.delete('/organizations/:id', organizationController.destroy)

router.post('/:organization/members', organizationMiddleware, ownerMiddleware, memberController.create)
router.get('/:organization/members', organizationMiddleware, memberMiddleware, memberController.index)
router.get('/:organization/members/:id', organizationMiddleware, memberMiddleware, memberController.view)
router.put('/:organization/members/:id', organizationMiddleware, ownerMiddleware, memberController.update)
router.delete('/:organization/members/:id', organizationMiddleware, memberMiddleware, memberController.destroy)

router.post('/:organization/accounts', organizationMiddleware, connectionOrganizationMiddleware, accountController.create)
router.get('/:organization/accounts', organizationMiddleware, connectionOrganizationMiddleware, accountController.index)
router.get('/:organization/accounts/:id', organizationMiddleware, connectionOrganizationMiddleware, accountController.show)
router.put('/:organization/accounts/:id', organizationMiddleware, connectionOrganizationMiddleware, accountController.update)
router.delete('/:organization/accounts/:id', organizationMiddleware, connectionOrganizationMiddleware, accountController.destroy)

router.post('/:organization/entries', organizationMiddleware, connectionOrganizationMiddleware, entryController.create)
router.get('/:organization/entries', organizationMiddleware, connectionOrganizationMiddleware, entryController.index)
router.get('/:organization/entries/:id', organizationMiddleware, connectionOrganizationMiddleware, entryController.show)
router.put('/:organization/entries/:id', organizationMiddleware, connectionOrganizationMiddleware, entryController.update)
router.delete('/:organization/entries/:id', organizationMiddleware, connectionOrganizationMiddleware, entryController.destroy)

//router.delete('/accounts', adminMiddleware, accountController.destroy)
//router.delete('/entries', adminMiddleware, entryController.destroy)

//router.get('/admin/users', adminMiddleware, adminUsersController.index)
//router.delete('/admin/users/:id', adminMiddleware, adminUsersController.destroy)
//router.delete('/admin/users', adminMiddleware, adminUsersController.destroy)
