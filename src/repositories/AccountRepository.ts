import { EntityRepository, Repository } from "typeorm";
import { Account } from "../models/organization/Account";

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {

}