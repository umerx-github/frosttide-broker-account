import { sql } from 'kysely';
export function enumeration(...args: string[]) {
    return sql`enum(${sql.join(args.map(sql.lit))})`;
}
