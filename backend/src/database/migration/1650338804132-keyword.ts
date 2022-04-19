import {MigrationInterface, QueryRunner} from "typeorm";

export class keyword1650338804132 implements MigrationInterface {
    name = 'keyword1650338804132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "keyword" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT 'now()', "modifiedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT 'now()', "name" character varying(500) NOT NULL, "jobQueueId" character varying(30) NOT NULL, "isFinishedScraping" boolean NOT NULL DEFAULT false, "adwordsCount" integer, "linksCount" integer, "resultStats" character varying(100), "rawHtml" text, "createdById" uuid, "modifiedById" uuid, CONSTRAINT "unique_keyword_per_user" UNIQUE ("name", "createdById"), CONSTRAINT "CHK_69814c4d48bb4d27d851151f45" CHECK ("linksCount" >= 0), CONSTRAINT "CHK_c3fddbc667410e7b167c15bfbd" CHECK ("adwordsCount" >= 0), CONSTRAINT "PK_affdb8c8fa5b442900cb3aa21dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "keyword" ADD CONSTRAINT "FK_92e301cbc8d6000d92cf3beb825" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "keyword" ADD CONSTRAINT "FK_2a63bb4ffb32e031a0ab02a8eb7" FOREIGN KEY ("modifiedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "keyword" DROP CONSTRAINT "FK_2a63bb4ffb32e031a0ab02a8eb7"`);
        await queryRunner.query(`ALTER TABLE "keyword" DROP CONSTRAINT "FK_92e301cbc8d6000d92cf3beb825"`);
        await queryRunner.query(`DROP TABLE "keyword"`);
    }

}
