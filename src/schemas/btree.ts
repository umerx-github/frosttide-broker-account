import z from 'zod';

export const bTreeNodeSchemaBase = z.object({
    isLeaf: z.boolean(),
    keys: z.array(z.number()),
});

type BTreeNode = z.infer<typeof bTreeNodeSchemaBase> & {
    children: BTreeNode[];
};

export const bTreeNodeSchema: z.ZodType<BTreeNode> = bTreeNodeSchemaBase.extend(
    {
        children: z.lazy(() => bTreeNodeSchema.array()),
    }
);

export const btreeSchema = z.object({
    t: z.number(),
    root: bTreeNodeSchema,
});
