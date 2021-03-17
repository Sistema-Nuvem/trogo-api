import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateUsers1615926604570 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'users',
				columns: [
					{
						name: 'id',
						type: 'uuid',
						isPrimary: true,
					},
					{
						name: 'login',
						type: 'varchar',
					},
					{
						name: 'active',
						type: 'bool',
						default: 'true',
					},
					{
						name: 'name',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'plataform',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'avatar_url',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'email',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'password_hash',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'created_at',
						type: 'timestamp',
						default: 'now()', 
					},
				],
			})
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('users')
	}

}
