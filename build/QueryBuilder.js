import { get, first } from 'lodash';
import { wrap } from './helpers';
export default class QueryBuilder {
    /**
     * Create a new query builder instance.
     */
    constructor(db, table) {
        /**
         * The where constraints for the query.
         */
        this.wheres = [];
        /**
         * The columns to be selected.
         */
        this.columns = ['*'];
        this.db = db;
        this.table = table;
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
     * Perform an update query.
     */
    update(attributes) {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                const placeholder = Object.keys(attributes)
                    .map((column) => `${wrap(column, '`')} = ?`)
                    .join(', ');
                tx.executeSql(['update', this.table, 'set', placeholder, this.buildWhere()].join(' '), Object.values(attributes), (_, result) => {
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
     */
    delete() {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql(`delete from ${this.table} ${this.buildWhere()}`, [], (_, result) => {
                    resolve(result.insertId !== undefined);
                }, (_, error) => {
                    reject(error);
                    return true;
                });
            });
        });
    }
    /**
     * Execute the query and get all results.
     */
    get() {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql([
                    'select',
                    this.columns.join(', '),
                    'from',
                    this.table,
                    this.buildWhere(),
                ].join(' '), [], (_, result) => {
                    resolve(get(result.rows, '_array', []));
                }, (_, error) => {
                    reject(error);
                    return true;
                });
            });
        });
    }
    /**
     * Execute the query and get the first result.
     */
    first() {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql([
                    'select',
                    this.columns.join(', '),
                    'from',
                    this.table,
                    this.buildWhere(),
                    'limit ?',
                ].join(' '), [1], (_, result) => {
                    const results = get(result.rows, '_array', []);
                    resolve(first(results));
                }, (_, error) => {
                    reject(error);
                    return true;
                });
            });
        });
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
     * Build an array of wheres to an sql compatible query.
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
