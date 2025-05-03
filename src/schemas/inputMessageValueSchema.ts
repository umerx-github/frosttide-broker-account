import { z } from 'zod';
import { requestedAccountCreateSchema } from './requestedAccountCreateSchema.js';

export const inputMessageValueSchema = z.union([
    z.object({
        eventType: z.enum(['RequestedAccountList']),
    }),
    z.object({
        eventType: z.enum(['RequestedAccountCreateIntent']),
    }),
    z.object({
        eventType: z.enum(['RequestedAccountCreate']),
        messageId: z.number().int().min(0),
        lastReadVersionId: z.number().int().min(0).nullable(),
        data: requestedAccountCreateSchema,
    }),
    z.object({
        eventType: z.enum(['RequestedAccountUpdate']),
        messageId: z.number().int().min(0),
        lastReadVersionId: z.number().int().min(0).nullable(),
        data: requestedAccountCreateSchema.extend({
            id: z.number().int().min(0),
        }),
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
