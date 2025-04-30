import { z } from 'zod';

export const requestedAccountCreateSchema = z.object({
    platform: z.enum(['Alpaca']),
    platformAccountId: z.string(),
    platformAPIKey: z.string(),
});
