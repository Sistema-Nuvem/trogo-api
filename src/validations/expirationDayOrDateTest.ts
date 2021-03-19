import * as yup from 'yup'
import { momentDate } from './momentDate'

export const expirationDayOrDateTest: any = {
  name: 'expirationTest',
  test: (_: any, context: any) => {
    const originalExpiration = context.originalValue
    if (typeof originalExpiration === 'undefined' || originalExpiration === null) return true

    const expirationDaySchema = yup.number().nullable().integer().min(1).max(31)
    if (expirationDaySchema.isValidSync(originalExpiration)) return true

    const expirationDateSchema = momentDate()

    if (expirationDateSchema.isValidSync(originalExpiration)) return true

    return context.createError({
      message: '${path} is not a valid day of month (1 to 31) or date (YYYY-MM-DD)',
    })
  }
}
