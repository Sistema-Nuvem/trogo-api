import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateOrganizations1615991480069 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'organizations',
				columns: [
					{
						name: 'id',
						type: 'uuid',
						isPrimary: true,
					},
					{
						name: 'owner_id',
						type: 'uuid',
					},
					{
						name: 'name',
						type: 'varchar',
					},
					{
						name: 'id_name',
						type: 'varchar'
					},
					{
						name: 'description',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'picture_url',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'active',
						type: 'bool',
						default: "TRUE",
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
		await queryRunner.dropTable('organizations')
	}
}
