import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCameraTable1739516035265 implements MigrationInterface {
  name = 'CreateCameraTable1739516035265';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "camera" ("id" character varying(30) NOT NULL, "username" character varying(100) NOT NULL, "password" character varying(250) NOT NULL, "name" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3e6992bc5e67b9f9a6f95a5fe6f" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "camera"`);
  }
}
