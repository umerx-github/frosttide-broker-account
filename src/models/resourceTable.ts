import { Transaction } from 'kysely';
import { Resource, Database } from '../interfaces/Database.js';
import { NewResource } from '../interfaces/Database.js';

export async function findResourceByName(
    trx: Transaction<Database>,
    name: string
) {
    return trx
        .selectFrom('Resource')
        .where('name', '=', name)
        .selectAll()
        .executeTakeFirst();
}

export async function createResource(
    trx: Transaction<Database>,
    resource: NewResource
) {
    await trx
        .insertInto('Resource')
        .values({
            ...resource,
        })
        .executeTakeFirstOrThrow();
    const result = await findResourceByName(trx, resource.name);
    if (result === undefined) {
        throw new Error('Failed to create AccountAlpaca');
    }
    return result;
}

export async function upsertResource(
    trx: Transaction<Database>,
    resource: NewResource
) {
    const existingResource = await trx
        .selectFrom('Resource')
        .forUpdate()
        .where('name', '=', resource.name)
        .selectAll()
        .executeTakeFirst();
    if (existingResource) {
        return trx
            .updateTable('Resource')
            .set({ ...resource })
            .where('name', '=', resource.name)
            .executeTakeFirstOrThrow();
    } else {
        return createResource(trx, resource);
    }
}
