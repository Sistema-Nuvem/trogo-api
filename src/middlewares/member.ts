import { NextFunction, Request, Response } from "express"
import { isMember } from "../controllers/util/organization"

export default async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { ownerId, userId, organizationId } = request as any
    
    if (ownerId !== userId && !isMember(organizationId, userId)) {
      return response.status(401).json({ error: 'Access denied!' })
    }
    
    return next()
  }
  catch(error) {
    return response.status(500).json({ error: error.message })
  }
}
