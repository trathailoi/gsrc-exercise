import {MigrationInterface, QueryRunner} from "typeorm";

export class keywordOmitJobQueueId1650590334078 implements MigrationInterface {
    name = 'keywordOmitJobQueueId1650590334078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "keyword" DROP COLUMN "jobQueueId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "keyword" ADD "jobQueueId" character varying(30)`);
    }

}
