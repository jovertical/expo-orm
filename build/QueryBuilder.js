import { wrap } from './helpers';
export default class QueryBuilder {
    /**
     * Create a new query builder instance
     */
    constructor(table) {
        /**
         * The where constraints for the query.
         */
        this.wheres = [];
        /**
         * The columns to be selected.
         */
        this.columns = ['*'];
        this.table = table;
    }
    insert(attributes) {
        const fields = Object.keys(attributes).join(',');
        const placeholder = Object.keys(attributes)
            .map(() => '?')
            .join(',');
        return `insert into ${this.table} (${fields}) values (${placeholder})`;
    }
    update(attributes) {
        const placeholder = Object.keys(attributes)
            .map((column) => `${wrap(column, '`')} = ?`)
            .join(', ');
        return `update ${this.table} set ${placeholder} ${this.buildWhere()}`;
    }
    delete() {
        return `delete from ${wrap(this.table, '`')} ${this.buildWhere()}`;
    }
    get() {
        return `
      select 
      ${this.columns.join(', ')} 
      from ${wrap(this.table, '`')} 
      ${this.buildWhere()}
    `;
    }
    find() {
        return `
      select ${this.columns.join(', ')} 
      from ${wrap(this.table, '`')} 
      where id = ? 
      limit 1;
    `;
    }
    /**
     * Set the columns to be selected.
     */
    select(columns = ['*']) {
        this.columns = columns;
        return this;
    }
    /**
     * Add a basic where clause to the query.
     */
    where(column, condition, value, boolean = 'and') {
        this.wheres = [...this.wheres, { column, condition, value, boolean }];
        return this;
    }
    /**
     * Build the array of wheres as sql.
     */
    buildWhere() {
        return this.wheres
            .map((where, index) => [
            index > 0 ? where.boolean : '',
            'where',
            wrap(where.column, '`'),
            where.condition,
            where.value,
        ].join(' '))
            .join();
    }
}
