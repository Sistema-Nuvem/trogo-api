export interface PasswordConfigData {
  regex: RegExp
  instructions: string
}

export function passwordConfig(): PasswordConfigData {
  return ({
    regex: RegExp(process.env.PASSWORD_REGEX),
    instructions: process.env.PASSWORD_INSTRUCTIONS,
  })
}