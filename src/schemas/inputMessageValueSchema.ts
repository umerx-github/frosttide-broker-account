import { z } from 'zod';

export const inputMessageValueSchema = z.object({
    eventType: z.enum([
        'RequestedAccountList',
        'RequestedAccountAdd',
        'RequestedAccountUpdate',
        'RequestedAccountDelete',
    ]),
    messageId: z.number().int().min(0),
    lastReadVersionId: z.number().int().min(0),
    data: z.object({
        symbol: z.string(),
    }),
});
