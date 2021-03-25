import { NextFunction, Request, Response } from "express";
import createConnections from '../database';

export default async (_request: Request, _response: Response, next: NextFunction) => {
  await createConnections()

  return next()
}