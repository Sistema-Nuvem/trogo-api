import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import pify from 'pify';
import { getCustomRepository } from "typeorm";

import { authConfig } from "../config/auth";
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

    const userRepository = getCustomRepository(UserRepository)
    
    const userSession = await userRepository.findOne(request['userId']);

    if (!userSession) {
      return response.status(400).json({ error: 'Invalid session' });
    }

    return next()
  }
  catch(error) {
    return response.status(500).json({ error: error.message })
  }
}
