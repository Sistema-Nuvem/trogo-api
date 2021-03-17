import { EntityRepository, Repository } from "typeorm";
import { Entry } from "../models/Entry";

@EntityRepository(Entry)
export class EntryRepository extends Repository<Entry> {
  
}