import { Transaction } from 'kysely';
import { Database } from '../interfaces/Database.js';
import {
    NewAccountAlpaca,
    AccountAlpacaUpdate,
} from '../interfaces/Database.js';

export async function listAccountAlpaca(trx: Transaction<Database>) {
    return trx.selectFrom('AccountAlpaca').selectAll().execute();
}

export async function findAccountAlpacaById(
    trx: Transaction<Database>,
    id: number
) {
    return await trx
        .selectFrom('AccountAlpaca')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst();
}

export async function createAccountAlpaca(
    trx: Transaction<Database>,
    accountAlpaca: NewAccountAlpaca
) {
    const { insertId } = await trx
        .insertInto('AccountAlpaca')
        .values({
            ...accountAlpaca,
        })
        .executeTakeFirstOrThrow();
    const result = await findAccountAlpacaById(trx, Number(insertId));
    if (result === undefined) {
        throw new Error('Failed to create AccountAlpaca');
    }
    return result;
}

export async function updateAccountAlpacaById(
    trx: Transaction<Database>,
    id: number,
    accountAlpaca: AccountAlpacaUpdate
) {
    const { numUpdatedRows } = await trx
        .updateTable('AccountAlpaca')
        .set({ ...accountAlpaca })
        .where('id', '=', id)
        .executeTakeFirstOrThrow();
    const result = await findAccountAlpacaById(trx, id);
    if (result === undefined) {
        throw new Error('Failed to update AccountAlpaca');
    }
    return result;
}

export async function deleteAccountAlpacaById(
    trx: Transaction<Database>,
    id: number
) {
    const result = await findAccountAlpacaById(trx, id);
    if (result === undefined) {
        throw new Error('Failed to delete AccountAlpaca');
    }
    await trx
        .deleteFrom('AccountAlpaca')
        .where('id', '=', id)
        .executeTakeFirstOrThrow();
    return result;
}
