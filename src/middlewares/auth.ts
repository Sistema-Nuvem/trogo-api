import { NextFunction, Request, Response } from "express";
import pify from 'pify';
import jwt from 'jsonwebtoken';
import { authConfig } from "../config/auth";
import { getCustomRepository } from "typeorm";
import { UserRepository } from "../repositories/UserRepository";

export default async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { authorization } = request.headers
    
    if (!authorization) {
      return response.status(401).json({ error: 'Token not provided!' })
    }

    const [, token] = authorization.split(' ')

    if (!token) {
      return response.status(401).json({ error: 'Token not provided!' })
    }

    let decoded: any = null

    try {
      decoded = await pify(jwt.verify)(token, authConfig().secret)
    }
    catch(error) {
      return response.status(401).json({ error: 'Token invalid or expired!' })
    }

    request['userId'] = decoded.id

    const repository = getCustomRepository(UserRepository)

    const userSession = await repository.findOne(request['userId']);

    if (!userSession) {
      return response.status(400).json({ error: 'Invalid session' });
    }

    return next()
  }
  catch(error) {
    return response.status(500).json({ error: error.message })
  }
}
