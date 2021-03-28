import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class addFieldDocumentToEntry1616805524490 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('entries',
      new TableColumn({
        name: 'document_id',
        type: 'uuid',
        isNullable: true,
      })
    )
    await queryRunner.createForeignKey('entries',
      new TableForeignKey({
        name: 'FKDocument',
        columnNames: ['document_id'],
        referencedTableName: 'documents',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('entries', 'document_id')
  }

}
