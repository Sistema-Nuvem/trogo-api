import { Connection, createConnection, getConnection, getConnectionManager, getConnectionOptions } from 'typeorm'

export default async (): Promise<Connection> => {
  const manager = getConnectionManager()

  if (manager.has('default')) return getConnection()

  const options = await getConnectionOptions()
    
  Object.assign(options, {
    database: process.env.NODE_ENV === 'test' 
      ? './src/database/database.test.sqlite' 
      : options.database
  })

  return await createConnection(options)
}