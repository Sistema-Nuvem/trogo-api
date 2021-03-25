import { NextFunction, Request, Response } from "express"
import * as yup from 'yup'

import { getOrganizationFrom } from "../controllers/util/organization"

const validatorRouterParamOrganization = yup.string().required().label('roter param organization')

export default async (request: Request, response: Response, next: NextFunction) => {
  try {
    try {
      validatorRouterParamOrganization.validateSync(request.params.organization)
    }
    catch (error) {
      return response.status(400).json({ error: error.message })
    }

    const organization = await getOrganizationFrom(request.params, true)
    if (!organization) {
      return response.status(404).json({ error: 'Organization not found!' })
    }
    
    request['organizationId'] = organization.id
    request['ownerId'] = organization.owner_id
    request['organization'] = organization

    return next()
  }
  catch(error) {
    return response.status(500).json({ error: error.message })
  }
}
