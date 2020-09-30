import { WebSQLDatabase } from 'expo-sqlite';
export default class QueryBuilder {
    private db;
    /**
     * Create a new query builder instance.
     */
    constructor(db: WebSQLDatabase);
    /**
     * Perform a select * query.
     */
    selectAll(table: string): Promise<Array<any>>;
}
