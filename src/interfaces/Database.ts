import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { LockName } from './LockName.js';

export interface Database {
    AccountAlpaca: AccountAlpacaTable;
    Lock: LockTable;
}

export interface LockTable {
    name: LockName;
    versionId: number;
    proofOfInclusionBTreeSerialized: string;
}

export type Lock = Selectable<LockTable>;
export type NewLock = Insertable<LockTable>;
export type LockUpdate = Updateable<LockTable>;

// This interface describes the `person` table to Kysely. Table
// interfaces should only be used in the `Database` type above
// and never as a result type of a query!. See the `Person`,
// `NewPerson` and `PersonUpdate` types below.
export interface AccountAlpacaTable {
    id: Generated<number>;
    platformAccountId: string;
    platformAPIKey: string;
    versionId: number;
    proofOfInclusionBTreeSerialized: string;
}

export type AccountAlpaca = Selectable<AccountAlpacaTable>;
export type NewAccountAlpaca = Insertable<AccountAlpacaTable>;
export type AccountAlpacaUpdate = Updateable<AccountAlpacaTable>;
