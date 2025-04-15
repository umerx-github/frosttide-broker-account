import { z } from 'zod';

export const inputSchema = z.object({
    value: z.instanceof(Buffer).nullable(),
});
