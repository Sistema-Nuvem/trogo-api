import { EntityRepository, Repository } from "typeorm";
import { Organization } from "../models/Organization";

@EntityRepository(Organization)
export class OrganizationRepository extends Repository<Organization> {}