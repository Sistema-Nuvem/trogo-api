import { EntityRepository, Repository } from "typeorm";
import { Member } from "../models/Member";

@EntityRepository(Member)
export class MemberRepository extends Repository<Member> {}