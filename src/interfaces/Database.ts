import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
    AccountAlpaca: AccountAlpacaTable;
}

// This interface describes the `person` table to Kysely. Table
// interfaces should only be used in the `Database` type above
// and never as a result type of a query!. See the `Person`,
// `NewPerson` and `PersonUpdate` types below.
export interface AccountAlpacaTable {
    id: Generated<number>;
    platformAccountId: string;
    platformAPIKey: string;
}

export type AccountAlpaca = Selectable<AccountAlpacaTable>;
export type NewAccountAlpaca = Insertable<AccountAlpacaTable>;
export type AccountAlpacaUpdate = Updateable<AccountAlpacaTable>;
