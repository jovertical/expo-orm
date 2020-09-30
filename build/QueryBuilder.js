import { get } from 'lodash';
export default class QueryBuilder {
    /**
     * Create a new query builder instance.
     */
    constructor(db) {
        this.db = db;
    }
    /**
     * Perform a select * query.
     */
    selectAll(table) {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql(`select * from ${table}`, [], (_, result) => {
                    resolve(get(result.rows, '_array', []));
                }, (_, error) => {
                    reject(error);
                    return true;
                });
            });
        });
    }
}
