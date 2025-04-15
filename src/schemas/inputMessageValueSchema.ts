import { z } from 'zod';

export const inputMessageValueSchema = z.union([
    z.object({
        eventType: z.enum(['SubscribedToSymbol', 'UnsubscribedToSymbol']),
        data: z.object({
            symbol: z.string(),
        }),
    }),
    z.object({
        eventType: z.literal('ReportedSubscribedSymbols'),
        data: z.object({
            symbols: z.array(z.string()),
        }),
    }),
]);
