import { get } from 'lodash';
export default class QueryBuilder {
    /**
     * Create a new query builder instance.
     */
    constructor(db, table) {
        /**
         * The where constraints for the query.
         */
        this.wheres = [];
        this.db = db;
        this.table = table;
    }
    /**
     * Perform a select * query.
     */
    selectAll() {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql(`select * from ${this.table}`, [], (_, result) => {
                    resolve(get(result.rows, '_array', []));
                }, (_, error) => {
                    reject(error);
                    return true;
                });
            });
        });
    }
    /**
     * Perform an insert query.
     */
    insert(attributes) {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                const fields = Object.keys(attributes).join(',');
                const placeholder = Object.keys(attributes)
                    .map(() => '?')
                    .join(',');
                tx.executeSql(`insert into ${this.table} (${fields}) values (${placeholder})`, Object.values(attributes), (_, result) => {
                    resolve(result.insertId !== undefined);
                }, (_, error) => {
                    reject(error);
                    return true;
                });
            });
        });
    }
    /**
     * Perform a delete query.
     *
     * @throws Error when table name is not specified.
     */
    delete() {
        if (!this.table) {
            throw new Error('No table specified');
        }
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql([`delete from ${this.table}`, this.buildWhere()].join(' '), [], (_, result) => {
                    resolve(result.insertId !== undefined);
                }, (_, error) => {
                    reject(error);
                    return true;
                });
            });
        });
    }
    /**
     * Add a basic where clause to the query.
     */
    where(column, condition, value, boolean = 'and') {
        this.wheres = [...this.wheres, { column, condition, value, boolean }];
        return this;
    }
    /**
     * Build an array of wheres to an sql compatible query.
     */
    buildWhere() {
        return this.wheres
            .map((where, index) => [
            index > 0 ? where.boolean : '',
            'where',
            where.column,
            where.condition,
            where.value,
        ].join(' '))
            .join();
    }
}
