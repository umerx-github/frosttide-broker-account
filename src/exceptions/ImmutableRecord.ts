import ProofOfInclusionLock from '../interfaces/ProofOfInclusionLock.js';

export default class ImmutableRecord extends Error {
    public lock: ProofOfInclusionLock;
    constructor(message: string, lock: ProofOfInclusionLock) {
        super(message);
        this.lock = lock;
    }
}
