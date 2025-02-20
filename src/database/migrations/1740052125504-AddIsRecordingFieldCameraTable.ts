import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsRecordingFieldCameraTable1740052125504 implements MigrationInterface {
  name = 'AddIsRecordingFieldCameraTable1740052125504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "camera" ADD "isRecording" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "camera" DROP COLUMN "isRecording"`);
  }
}
