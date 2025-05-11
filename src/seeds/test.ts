import { sql } from 'kysely';
import { db } from '../connections/database.js';
import { createAccountAlpaca } from '../models/alpacaAccountTable.js';
import { upsertLock } from '../models/lockTable.js';
export async function seed() {
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
                    '{"t":3,"root":{"isLeaf":true,"keys":[1],"children":[]}}',
            });
            await createAccountAlpaca(trx, {
                recordStatus: 'ACTIVE',
                platformAccountId: 'qwe456',
                platformAPIKey: '645rty',
                versionId: 0,
                proofOfInclusionBTreeSerialized:
                    '{"t":3,"root":{"isLeaf":false,"keys":[4],"children":[{"isLeaf":true,"keys":[2,3],"children":[]},{"isLeaf":true,"keys":[5,6,7],"children":[]}]}}',
            });
            await createAccountAlpaca(trx, {
                versionId: 0,
                proofOfInclusionBTreeSerialized:
                    '{"t":3,"root":{"isLeaf":true,"keys":[4],"children":[]}}',
                recordStatus: 'DELETED',
                platformAccountId: 'uyt321',
                platformAPIKey: 'bnm123',
            });
        });
}
