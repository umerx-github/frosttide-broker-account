export const lockNames = [
    'RequestedAccountCreate',
    'RequestedAccountDelete',
] as const;
export type LockName = (typeof lockNames)[number];
