import { number, z } from 'zod';
import { requestedAccountAddSchema } from './requestedAccountAddSchema.js';

export const inputMessageValueSchema = z.union([
    z.object({
        eventType: z.enum(['RequestedAccountList']),
        messageId: z.number().int().min(0),
    }),
    z.object({
        eventType: z.enum(['RequestedAccountAdd']),
        messageId: z.number().int().min(0),
        lastReadVersionId: z.number().int().min(0).nullable(),
        data: requestedAccountAddSchema,
    }),
    z.object({
        eventType: z.enum(['RequestedAccountUpdate']),
        messageId: z.number().int().min(0),
        lastReadVersionId: z.number().int().min(0).nullable(),
        data: requestedAccountAddSchema.extend({ id: z.number().int().min(0) }),
    }),
    z.object({
        eventType: z.enum(['RequestedAccountDelete']),
        messageId: z.number().int().min(0),
        lastReadVersionId: z.number().int().min(0).nullable(),
        data: z.object({
            id: z.number().int().min(0),
        }),
    }),
]);
