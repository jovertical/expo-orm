export default class QueryBuilder {
    /**
     * The where constraints for the query.
     */
    private wheres;
    /**
     * The columns to be selected.
     */
    private columns;
    /**
     * The table which the query is targeting
     */
    private table;
    /**
     * Create a new query builder instance
     */
    constructor(table: string);
    insert(attributes: Object): string;
    update(attributes: Object): string;
    delete(): string;
    get(): string;
    find(): string;
    /**
     * Set the columns to be selected.
     */
    select(columns?: string[]): QueryBuilder;
    /**
     * Add a basic where clause to the query.
     */
    where(column: string, condition: ConditionalOperator, value: ValidValue, boolean?: LogicalOperator): QueryBuilder;
    /**
     * Build the array of wheres as sql.
     */
    private buildWhere;
}
