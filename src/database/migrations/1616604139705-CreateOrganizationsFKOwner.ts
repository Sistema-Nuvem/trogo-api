import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export class CreateOrganizationsFKOwner1616604139705 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey("organizations", 
      new TableForeignKey(
        {
        name: 'FKOwner',
        columnNames: ['owner_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE', 
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('organizations', 'FKOwner')
  }

}
