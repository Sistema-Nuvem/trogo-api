import { NextFunction, Request, Response } from "express"
import { createConnectionOrganization, getOrganizationConnectionName } from "../database/organization"

export default async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { organizationId } = request as any
    await createConnectionOrganization(organizationId)
    request['organizationConnectionName'] = getOrganizationConnectionName(organizationId)

    return next()
  }
  catch(error) {
    return response.status(500).json({ error: error.message })
  }
}
