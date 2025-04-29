import { Transaction } from 'kysely';
import { Database } from '../interfaces/Database.js';
import { NewLock } from '../interfaces/Database.js';
import { LockName } from '../interfaces/LockName.js';

export async function findLockByName(
    trx: Transaction<Database>,
    name: LockName
) {
    return trx
        .selectFrom('Lock')
        .where('name', '=', name)
        .selectAll()
        .executeTakeFirst();
}

export async function createLock(trx: Transaction<Database>, lock: NewLock) {
    await trx
        .insertInto('Lock')
        .values({
            ...lock,
        })
        .executeTakeFirstOrThrow();
    const result = await findLockByName(trx, lock.name);
    if (result === undefined) {
        throw new Error('Failed to create AccountAlpaca');
    }
    return result;
}

export async function upsertLock(trx: Transaction<Database>, lock: NewLock) {
    const existingLock = await trx
        .selectFrom('Lock')
        .forUpdate()
        .where('name', '=', lock.name)
        .selectAll()
        .executeTakeFirst();
    if (existingLock) {
        const { numUpdatedRows } = await trx
            .updateTable('Lock')
            .set({ ...lock })
            .where('name', '=', lock.name)
            .executeTakeFirstOrThrow();
        const result = await findLockByName(trx, lock.name);
        if (result === undefined) {
            throw new Error('Failed to update AccountAlpaca');
        }
        return result;
    } else {
        return createLock(trx, lock);
    }
}
