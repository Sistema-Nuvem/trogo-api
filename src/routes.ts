import { Request, Response, Router } from "express"
import { AccountController } from './controllers/AccountController'
import { AdminUsersController } from "./controllers/AdminUsersController"
import { EntryController } from './controllers/EntryController'
import { MemberController } from "./controllers/MemberController"
import { SessionController } from "./controllers/SessionController"
import { UserControler } from "./controllers/UserController"
import { OrganizationController } from "./controllers/OrganizationController"
import { UserPasswordController } from "./controllers/UserPasswordController"
import adminMiddleware from './middlewares/admin'
import authMiddleware from './middlewares/auth'

export const router = Router()

const sessionController = new SessionController()
const userController = new UserControler()
const adminUsersController = new AdminUsersController()
const userPasswordController = new UserPasswordController()
const accountController = new AccountController()
const entryController = new EntryController()
const organizationController = new OrganizationController()
const memberController = new MemberController()

router.get('/', (_: Request, response: Response) => {
  response.send('<h1>Trogo API</h1>')
})

router.post('/users', userController.create)
router.post('/sessions', sessionController.create)

router.use(authMiddleware)

router.put('/users/password/:id', userPasswordController.update)

router.get('/users/:id', userController.show)
router.delete('/users/:id', userController.destroy)

router.post('/accounts', accountController.create)
router.get('/accounts', accountController.index)
router.get('/accounts/:id', accountController.show)
router.delete('/accounts/:id', accountController.destroy)

router.post('/entries', entryController.create)
router.get('/entries', entryController.index)
router.get('/entries/:id', entryController.show)
router.delete('/entries/:id', entryController.destroy)

router.post('/organizations', organizationController.create)
router.get('/organizations', organizationController.index)
router.get('/organizations/:id', organizationController.show)
router.delete('/organizations/:id', organizationController.destroy)

router.post('/members', memberController.create)
router.delete('/members/:organization_id/:user_id', memberController.destroy)

router.delete('/accounts', adminMiddleware, accountController.destroy)
router.delete('/entries', adminMiddleware, entryController.destroy)

router.get('/admin/users', adminMiddleware, adminUsersController.index)
router.delete('/admin/users/:id', adminMiddleware, adminUsersController.destroy)
router.delete('/admin/users', adminMiddleware, adminUsersController.destroy)
