export default class Database {
    /**
     * The database connection to use
     */
    private db;
    /**
     * The query builder
     */
    private query;
    /**
     * Create a new database instance
     *
     * @todo Option to override default connection
     */
    constructor(table: string);
    /**
     * Set the table which the query is targeting
     */
    static table(name: string): Database;
    get(): Promise<Array<any>>;
    find(id: number | string): Promise<Object | undefined>;
    insert(attributes: Object): Promise<Object | undefined>;
    update(attributes: Object): Promise<boolean>;
    delete(): Promise<boolean>;
    where(column: string, condition: ConditionalOperator, value: ValidValue, boolean?: LogicalOperator): Database;
    select(columns?: string[]): Database;
    private executeBulkSql;
    private executeSql;
}
