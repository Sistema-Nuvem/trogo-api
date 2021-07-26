import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class inTableEntryRenameFieldDocumentIdToInvoiceIdAndAddFieldProofId1617029961762 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.renameColumn('entries', 'document_id', 'invoice_id')
		
		await queryRunner.addColumn('entries',
			new TableColumn({
				name: 'proof_id',
				type: 'uuid',
				isNullable: true,
			})
		)

		await queryRunner.createForeignKey('entries', 
			new TableForeignKey({
				name: 'FKProof',
				columnNames: ['proof_id'],
				referencedTableName: 'documents',
				referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
			}),
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('entries', 'proof_id')
		await queryRunner.renameColumn('entries', 'invoice_id', 'document_id')
	}
}
