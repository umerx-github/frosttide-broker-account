import { sql } from 'kysely';
import { db } from "../connections/database.js";
export async function connect() {
    try {
        await db.transaction().execute(async trx => {
            await sql`SELECT 1;`.execute(trx);
        })
    } finally {
        await db.destroy();
    }
}
await connect();
