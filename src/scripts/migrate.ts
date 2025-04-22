import * as path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import {
    Migrator,
    FileMigrationProvider,
    NO_MIGRATIONS,
    MigrationResult,
} from 'kysely';
import { db } from '../connections/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate(direction: 'up' | 'down' = 'up') {
    const migrationFolder = path.join(__dirname, '..', '/migrations');
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
        switch (it.status) {
            case 'Success':
                console.log(
                    `migration "${it.migrationName}" was successfully brought ${direction}`
                );
                break;
            case 'Error':
                console.error(
                    `failed to bring "${it.migrationName}" ${direction}`
                );
                break;
            case 'NotExecuted':
                console.log(
                    `did not execute "${it.migrationName}" ${direction}`
                );
                break;
            default:
                console.error(
                    `encountered unknown migration status when trying to bring "${it.migrationName}" ${direction}`
                );
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
