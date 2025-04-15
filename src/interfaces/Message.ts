export default interface Message {
    key?: Buffer | string | null;
    value: Buffer | string | null;
    offset: number;
    commit(): Promise<void>;
}
