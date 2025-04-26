import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('AlpacaAccount')
        .ifNotExists()
        .addColumn('id', 'bigint', (col) => col.primaryKey().autoIncrement())
        .addColumn('platformAccountId', 'text', (col) => col.notNull())
        .addColumn('platformAPIKey', 'text', (col) => col.notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('AlpacaAccount').ifExists().execute();
}
