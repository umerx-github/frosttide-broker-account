import { db } from '../connections/database.js';
// https://mochajs.org/#root-hook-plugins:~:text=before%20each%20test-,afterAll,-%3A
export const mochaHooks = {
    afterAll: [
        async function () {
            await db.destroy();
        },
    ],
};
