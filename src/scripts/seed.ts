import { sql } from 'kysely';
import { db } from '../connections/database.js';
import { createAccountAlpaca } from '../models/alpacaAccountTable.js';
import { upsertLock } from '../models/lockTable.js';
async function seed() {
    try {
        await db
            .transaction()
            .setIsolationLevel('serializable')
            .execute(async (trx) => {
                await sql`TRUNCATE TABLE \`Lock\`;`.execute(trx);
                await sql`TRUNCATE TABLE \`AccountAlpaca\`;`.execute(trx);
                await upsertLock(trx, {
                    name: 'RequestedAccountCreate',
                    versionId: 1,
                    proofOfInclusionBTreeSerialized:
                        '{"t":3,"root":{"isLeaf":true,"keys":[2,2],"children":[]}}',
                });
                await createAccountAlpaca(trx, {
                    recordStatus: 'ACTIVE',
                    platformAccountId: 'qwe456',
                    platformAPIKey: '645rty',
                    versionId: 0,
                    proofOfInclusionBTreeSerialized:
                        '{"t":3,"root":{"isLeaf":true,"keys":[2],"children":[]}}',
                });
                await createAccountAlpaca(trx, {
                    versionId: 0,
                    proofOfInclusionBTreeSerialized:
                        '{"t":3,"root":{"isLeaf":true,"keys":[2],"children":[]}}',
                    recordStatus: 'DELETED',
                    platformAccountId: 'uyt321',
                    platformAPIKey: 'bnm123',
                });
            });
        console.log('Seeded!');
    } catch (e) {
        console.error(e);
    } finally {
        await db.destroy();
    }
}
seed();
