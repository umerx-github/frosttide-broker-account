import { Kysely } from 'kysely';
import { enumeration } from '../database/helpers.js';
import { lockNames } from '../interfaces/LockName.js';
import { recordStatuses } from '../interfaces/RecordStatus.js';
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('Lock')
        .ifNotExists()
        .addColumn('name', enumeration(...lockNames), (col) =>
            col.notNull().unique()
        )
        .addColumn('versionId', 'bigint')
        .addColumn('proofOfInclusionBTreeSerialized', 'text', (col) =>
            col.notNull()
        )
        .execute();
    await db.schema
        .createTable('AccountAlpaca')
        .ifNotExists()
        .addColumn('id', 'bigint', (col) => col.primaryKey().autoIncrement())
        .addColumn('recordStatus', enumeration(...recordStatuses), (col) =>
            col.notNull()
        )
        .addColumn('versionId', 'bigint')
        .addColumn('proofOfInclusionBTreeSerialized', 'text', (col) =>
            col.notNull()
        )
        .addColumn('platformAccountId', 'text', (col) => col.notNull())
        .addColumn('platformAPIKey', 'text', (col) => col.notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('AccountAlpaca').ifExists().execute();
    await db.schema.dropTable('Lock').ifExists().execute();
}
