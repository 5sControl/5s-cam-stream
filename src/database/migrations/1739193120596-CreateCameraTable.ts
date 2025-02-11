import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCameraTable1739193120596 implements MigrationInterface {
  name = 'CreateCameraTable1739193120596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "media"."cameras" ("id" SERIAL NOT NULL, "ip" character varying(45) NOT NULL, "username" character varying(128) NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f4ccf9e2171a1edcf08ddb2e47b" UNIQUE ("ip"), CONSTRAINT "PK_88b40b9817f9f422121f861e1e8" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "media"."cameras"`);
  }
}
