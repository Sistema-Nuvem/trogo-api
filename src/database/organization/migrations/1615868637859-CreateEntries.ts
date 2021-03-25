import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateEntries1615868637859 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'entries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'account_id',
            type: 'uuid',
          },
          {
            name: 'expiration',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'value',
            type: 'number',
            isNullable: true
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payed',
            type: 'bool',
            default: 'false',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
        ],
        foreignKeys: [
          {
            name: 'FKAccount',
            referencedTableName: 'accounts',
            referencedColumnNames: ['id'],
            columnNames: ['account_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('entries')
  }

}
