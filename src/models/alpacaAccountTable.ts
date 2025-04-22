import { Transaction } from 'kysely';
import { Database } from '../interfaces/Database.js';
import { NewAccountAlpaca } from '../interfaces/Database.js';

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
    const accountAlpacaResult = await findAccountAlpacaById(
        trx,
        Number(insertId)
    );
    if (accountAlpacaResult === undefined) {
        throw new Error('Failed to create stream out');
    }
    return accountAlpacaResult;
}
