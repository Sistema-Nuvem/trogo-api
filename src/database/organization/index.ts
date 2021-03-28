import { Connection, ConnectionOptions, createConnection, getConnection, getConnectionManager, getConnectionOptions } from "typeorm"
import { CONNECTION_ORGANIZATION } from "../connectionsNames"

export function getOrganizationConnectionName(organization_id: string): string {
  return `${CONNECTION_ORGANIZATION}_${organization_id}`
}

export async function createConnectionOrganization(organization_id: string): Promise<Connection> {
  const connectionName = getOrganizationConnectionName(organization_id)
  
  const manager = getConnectionManager()

  if (manager.has(connectionName)) {
    const connection = getConnection(connectionName)

    console.log(`pegando conexão ${connection.name} ...`)
    return connection
  }
  else {
    const defaultOptions = await getConnectionOptions()

    const options = {
      ...defaultOptions,
      name: connectionName,
      database: `./src/database/organization/databases.sqlite/database.${organization_id}.sqlite`,
      migrations: ["./src/database/organization/migrations/**.ts"],
      entities: [
        "./src/models/organization/**.ts",
        "./src/models/**.ts",
      ],
      migrationsRun: true,
    } as ConnectionOptions

    console.log(`criando conexão ${connectionName} ...`)
    return await createConnection(options)
  }
}