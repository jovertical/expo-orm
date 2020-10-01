import { WebSQLDatabase } from 'expo-sqlite';
declare type ConditionalOperator = '=' | '!=' | '>' | '>=' | '<' | '<=';
declare type ValidValue = number | string | null;
declare type LogicalOperator = 'and' | 'or' | 'not';
export default class QueryBuilder {
    private db;
    /**
     * The table which the query is targeting.
     */
    private table?;
    /**
     * The where constraints for the query.
     */
    private wheres;
    /**
     * The columns to be selected.
     */
    private columns;
    /**
     * Create a new query builder instance.
     */
    constructor(db: WebSQLDatabase, table: string);
    /**
     * Perform an insert query.
     */
    insert(attributes: Object): Promise<boolean>;
    /**
     * Perform an update query.
     */
    update(attributes: Object): Promise<boolean>;
    /**
     * Perform a delete query.
     */
    delete(): Promise<boolean>;
    /**
     * Execute the query and get all results.
     */
    get(): Promise<Array<Object>>;
    /**
     * Execute the query and get the first result.
     */
    first(): Promise<unknown>;
    /**
     * Set the columns to be selected.
     */
    select(columns?: string[]): QueryBuilder;
    /**
     * Add a basic where clause to the query.
     */
    where(column: string, condition: ConditionalOperator, value: ValidValue, boolean?: LogicalOperator): QueryBuilder;
    /**
     * Build an array of wheres to an sql compatible query.
     */
    private buildWhere;
}
export {};
