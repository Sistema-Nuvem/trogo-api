import { Request, Response } from "express"
import { getCustomRepository } from "typeorm"
import { compareSync, hashSync } from "bcrypt"
import * as yup from 'yup'

import { UserRepository } from "../repositories/UserRepository"
import { passwordConfig } from "../config/password"
import { ConditionBuilder, ConditionOptions } from "yup/lib/Condition"
import { Context } from "node:vm"
import { Schema } from "node:inspector"

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

      const schema = yup.object().shape({
        password_confirm: yup.string()
          .label('confirm password')
          .required('Confirm password not provided!')
          .test({
            message: 'New and confirm password not math!',
            test: (value: any, context: any): any => (
              value === context.parent.password_new
            )
          }),
        password_new: yup.string()
          .label('new password')
          .required('New password not provided!')
          .test({
            message: 'The new password must be different from the current one!',
            test: (value: any, context: any): any => (
              value !== context.parent.password
            )
          })
          .matches(
            passwordConfig().regex, 
            passwordConfig().instructions,
          ),
        password: yup.string()
          .required('Password not provided!'),
      })

      try {
        schema.validateSync(request.body)
      }
      catch (error) {
        return response.status(400).json({ error: error.message })
      }

      const { password, password_new } = request.body
      
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