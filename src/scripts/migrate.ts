import * as path from 'path';
import { promises as fs } from 'fs';
import {
    Migrator,
    FileMigrationProvider,
    NO_MIGRATIONS,
    MigrationResult,
} from 'kysely';
import { db } from '../connections/database.js';

async function migrate(direction: 'up' | 'down') {
    const migrationFolder = path.join('..', __dirname, '/migrations');
    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            // This needs to be an absolute path.
            migrationFolder,
        }),
    });

    let error = undefined;
    let results: MigrationResult[] | undefined = undefined;

    if (direction === 'down') {
        ({ error, results } = await migrator.migrateTo(NO_MIGRATIONS));
    } else {
        ({ error, results } = await migrator.migrateToLatest());
    }

    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(
                `migration "${it.migrationName}" was executed successfully`
            );
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration "${it.migrationName}"`);
        }
    });

    if (error) {
        console.error('failed to migrate');
        console.error(error);
        process.exit(1);
    }

    await db.destroy();
}

migrate(process.argv[2] as 'up' | 'down');
