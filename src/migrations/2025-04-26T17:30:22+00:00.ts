import { Kysely } from 'kysely';
import { enumeration } from '../database/helpers.js';
import { LockName, lockNames } from '../interfaces/LockName.js';

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
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('Lock').ifExists().execute();
}
