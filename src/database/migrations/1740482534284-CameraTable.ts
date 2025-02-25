import { MigrationInterface, QueryRunner } from 'typeorm';

export class CameraTable1740482534284 implements MigrationInterface {
  name = 'CameraTable1740482534284';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "camera" DROP COLUMN "isRecording"`);
    await queryRunner.query(
      `ALTER TABLE "camera" ADD "is_recording" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "camera" DROP COLUMN "is_recording"`);
    await queryRunner.query(
      `ALTER TABLE "camera" ADD "isRecording" boolean NOT NULL DEFAULT false`,
    );
  }
}
