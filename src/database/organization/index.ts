import { Connection, createConnection, getConnection, getConnectionManager, getConnectionOptions } from "typeorm"

import { CONNECTION_ORGANIZATION } from "../connectionsNames"

export async function createConnectionOrganization(organization_id: string): Promise<Connection> {
  try {
    const manager = getConnectionManager()
    
    let connection: Connection

    if (manager.has(CONNECTION_ORGANIZATION)) {
      connection = getConnection(CONNECTION_ORGANIZATION)
    }
    else {
      const options = await getConnectionOptions()
      
      Object.assign(options, {
        name: CONNECTION_ORGANIZATION,
        database: `./src/database/organization/databases.sqlite/database.${organization_id}.sqlite`,
        migrations: ["./src/database/organization/migrations/**.ts"],
        entities: [
          "./src/models/organization/**.ts",
          "./src/models/**.ts",
        ],
      })
      
      connection = await createConnection(options)
    }

    return connection
  }
  catch (error) {
    return null
  }
}