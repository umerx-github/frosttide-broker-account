interface Lock {
    name: string;
    versionId: number | null;
    proofOfInclusionBTreeSerialized: string | null;
}

export default class StaleWrite extends Error {
    public lock: Lock;
    constructor(message: string, lock: Lock) {
        super(message);
        this.lock = lock;
    }
}
