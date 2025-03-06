import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVideosTable1739966576008 implements MigrationInterface {
  name = 'CreateVideosTable1739966576008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "media"."videos" ("id" SERIAL NOT NULL, "file_path" text NOT NULL, "start_time" bigint NOT NULL, "end_time" bigint NOT NULL, "camera_ip" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4c86c0cf95aff16e9fb8220f6b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "media"."videos"`);
  }
}
