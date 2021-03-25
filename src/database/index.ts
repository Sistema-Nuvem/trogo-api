import { Connection, createConnection, getConnectionManager, getConnectionOptions } from 'typeorm'
import { CONNECTION_DEFAULT } from './connectionsNames'

export default async (): Promise<Connection> => {
  const manager = getConnectionManager()

  if (manager.has(CONNECTION_DEFAULT)) return manager.get(CONNECTION_DEFAULT)

  const options = await getConnectionOptions(CONNECTION_DEFAULT)
    
  Object.assign(options, {
    name: CONNECTION_DEFAULT,
    database: process.env.NODE_ENV === 'test' 
      ? './src/database/database.test.sqlite' 
      : options.database
  })
  return await createConnection(options)
}