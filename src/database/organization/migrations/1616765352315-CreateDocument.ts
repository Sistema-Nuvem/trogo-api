import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateDocument1616765352315 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'documents',
				columns: [
					{
						name: 'id',
						type: 'uuid',
						isPrimary: true,
					},
					{
						name: 'name',
						type: 'varchar',
					},
					{
						name: 'path',
						type: 'varchar',
						isUnique: true,
					},
					{
						name: 'created_at',
						type: 'timestamp',
						default: 'now()', 
					},
					{
						name: 'updated_at',
						type: 'timestamp',
						isNullable: true, 
					},
				],
			})
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('documents')
	}

}
