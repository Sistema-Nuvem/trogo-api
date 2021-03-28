import { EntityRepository, Repository } from "typeorm";
import { Document } from "../models/organization/Document";

@EntityRepository(Document)
export class DocumentRepository extends Repository<Document> {}