import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCameraScheduleTable1740047785717 implements MigrationInterface {
  name = 'CreateCameraScheduleTable1740047785717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "camera_schedule" ("id" SERIAL NOT NULL, "camera_id" character varying(30) NOT NULL, "working_time_day_id" integer NOT NULL, CONSTRAINT "PK_df259b26a15ce806f3d7de11ae1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "camera_schedule" ADD CONSTRAINT "FK_63a309a2e5411b9aa6c16cf491c" FOREIGN KEY ("camera_id") REFERENCES "camera"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "camera_schedule" ADD CONSTRAINT "FK_b5b9cc31afa2a886255fde42ea7" FOREIGN KEY ("working_time_day_id") REFERENCES "working_time_days_of_week"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "camera_schedule" DROP CONSTRAINT "FK_b5b9cc31afa2a886255fde42ea7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "camera_schedule" DROP CONSTRAINT "FK_63a309a2e5411b9aa6c16cf491c"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "camera_schedule"`);
  }
}
