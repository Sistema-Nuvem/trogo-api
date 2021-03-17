import { NextFunction, Request, Response } from "express"

export default async (request: Request, response: Response, next: NextFunction) => {
  try {
    return response.status(401).json('Access denied!')
    //return next()
  }
  catch(error) {
    return response.status(500).json({ error: error.message })
  }
}
