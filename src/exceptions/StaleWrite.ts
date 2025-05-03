import { ProofOfInclusionLockNullable } from '../interfaces/ProofOfInclusionLock.js';

export default class StaleWrite extends Error {
    public lock: ProofOfInclusionLockNullable;
    constructor(message: string, lock: ProofOfInclusionLockNullable) {
        super(message);
        this.lock = lock;
    }
}
