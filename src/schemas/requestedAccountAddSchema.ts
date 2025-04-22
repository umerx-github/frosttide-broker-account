import { z } from 'zod';

export const requestedAccountAddSchema = z.object({
    platform: z.enum(['Alpaca']),
    platformAccountId: z.string(),
    platformAPIKey: z.string(),
});
