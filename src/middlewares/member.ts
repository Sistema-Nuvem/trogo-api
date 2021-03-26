import { NextFunction, Request, Response } from "express"
import { getCustomRepository } from "typeorm"

import { MemberRepository } from "../repositories/MemberRepository"

export default async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { ownerId, userId, organizationId } = request as any
    
    if (ownerId !== userId) {
      const isMember = await getCustomRepository(MemberRepository).isMember(organizationId, userId)
      if (!isMember) {
        return response.status(401).json({ error: 'Access denied!' })
      }
    }
    
    return next()
  }
  catch(error) {
    return response.status(500).json({ error: error.message })
  }
}
