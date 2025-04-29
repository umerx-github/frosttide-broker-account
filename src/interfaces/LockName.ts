export const lockNames = [
    'RequestedAccountAdd',
    'RequestedAccountDelete',
] as const;
export type LockName = (typeof lockNames)[number];
