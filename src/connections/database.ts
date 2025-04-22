import { Database } from '../interfaces/Database.js'; // this is the Database interface we defined earlier
import { createPool } from 'mysql2'; // do not use 'mysql2/promises'!
import { Kysely, MysqlDialect } from 'kysely';
import { env } from 'process';

const dialect = new MysqlDialect({
    pool: createPool({
        database: env.DB_NAME,
        host: env.DB_HOSTNAME,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        port: 3306,
        connectionLimit: 10,
        jsonStrings: false,
    }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
    dialect,
});
