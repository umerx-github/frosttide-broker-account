import { seed } from '../seeds/test.js'
import { db } from '../connections/database.js';
export async function executeSeed() {
    try {
        await seed();
        console.log('Seeded!');
    } catch (e) {
        console.error(e);
    } finally {
        await db.destroy();
    }
}
executeSeed();
