export const recordStatuses = ['ACTIVE', 'DELETED'] as const;
export type RecordStatus = (typeof recordStatuses)[number];
