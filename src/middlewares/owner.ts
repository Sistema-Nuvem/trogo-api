import { NextFunction, Request, Response } from "express"

export default async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { ownerId, userId } = request as any
    
    if (ownerId !== userId) {
      return response.status(401).json({ error: 'Access denied!' })
    }

    return next()
  }
  catch(error) {
    return response.status(500).json({ error: error.message })
  }
}
