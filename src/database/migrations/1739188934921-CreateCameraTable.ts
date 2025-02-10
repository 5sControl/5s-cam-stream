import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCameraTable1739188934921 implements MigrationInterface {
  name = 'CreateCameraTable1739188934921';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "media"."cameras" ("id" SERIAL NOT NULL, "ip" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_88b40b9817f9f422121f861e1e8" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "media"."cameras"`);
  }
}
