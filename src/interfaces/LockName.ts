export const lockNames = ['RequestedAccountCreate'] as const;
export type LockName = (typeof lockNames)[number];
