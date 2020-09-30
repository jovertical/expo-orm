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
     * Create a new query builder instance.
     */
    constructor(db: WebSQLDatabase, table: string);
    /**
     * Perform a select * query.
     */
    selectAll(): Promise<Array<any>>;
    /**
     * Perform an insert query.
     */
    insert(attributes: Object): Promise<boolean>;
    /**
     * Perform a delete query.
     *
     * @throws Error when table name is not specified.
     */
    delete(): Promise<boolean>;
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
