import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('Resource')
        .ifNotExists()
        .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('versionId', 'bigint')
        .addColumn('proofOfInclusionBTreeSerialized', 'text', (col) =>
            col.notNull()
        )
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('Resource').ifExists().execute();
}
