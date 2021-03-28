import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";

import { DocumentRepository } from '../repositories/DocumentRepository'

class DocumentController {
  async store(request: Request, response: Response) {
    try {
      const { originalname: name, filename: path } = request.file
      
      const { organizationConnectionName } = request as any

      const documentRepository = getCustomRepository(DocumentRepository, organizationConnectionName)
      
      const document = documentRepository.create({
        name,
        path
      })
      
      await documentRepository.save(document)
      
      return response.json(document)
    }
    catch (error) {
      console.log('ERROR:', error.message)
      return response.status(500).json({ error: error.message })
    }
  }
}

export default new DocumentController()