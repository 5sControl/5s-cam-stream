import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTablesForVideo1740045308199 implements MigrationInterface {
  name = 'CreateTablesForVideo1740045308199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "days_of_week" ("id" SERIAL NOT NULL, "day" text NOT NULL, CONSTRAINT "PK_a6d487a086eff1d512fba6df4c0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "working_time_days_of_week" ("id" SERIAL NOT NULL, "workingtime_id" integer NOT NULL, "dayofweek_id" integer NOT NULL, CONSTRAINT "PK_3f97ac13a2e19fd32249f90e416" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "working_time" ("id" SERIAL NOT NULL, "time_start" TIME NOT NULL, "time_end" TIME NOT NULL, CONSTRAINT "PK_e83baf54ea56298ebc26f35fbd3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_time_days_of_week" ADD CONSTRAINT "FK_42e397543e117cf84e70dac6d83" FOREIGN KEY ("workingtime_id") REFERENCES "working_time"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_time_days_of_week" ADD CONSTRAINT "FK_bf13aabc8abf269e91a1cfb347b" FOREIGN KEY ("dayofweek_id") REFERENCES "days_of_week"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "working_time_days_of_week" DROP CONSTRAINT "FK_bf13aabc8abf269e91a1cfb347b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_time_days_of_week" DROP CONSTRAINT "FK_42e397543e117cf84e70dac6d83"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "working_time"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "working_time_days_of_week"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "days_of_week"`);
  }
}
