export interface ProofOfInclusionLockNonNullable {
    versionId: number;
    proofOfInclusionBTreeSerialized: string;
}

export interface ProofOfInclusionLockNullable {
    versionId: number | null;
    proofOfInclusionBTreeSerialized: string | null;
}
