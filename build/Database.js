var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { openDatabase } from 'expo-sqlite';
import { get, first, values } from 'lodash';
import QueryBuilder from './QueryBuilder';
export default class Database {
    /**
     * Create a new database instance
     *
     * @todo Option to override default connection
     */
    constructor(table) {
        this.db = openDatabase('database.db');
        this.query = new QueryBuilder(table);
    }
    /**
     * Set the table which the query is targeting
     */
    static table(name) {
        return new Database(name);
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeSql(this.query.get())
                .then((result) => (result === null || result === void 0 ? void 0 : result.rows) || [])
                .catch((error) => {
                throw new Error(error);
            });
        });
    }
    find(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeSql(this.query.find(), [id])
                .then((result) => first(result === null || result === void 0 ? void 0 : result.rows))
                .catch((error) => {
                throw new Error(error);
            });
        });
    }
    insert(attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeSql(this.query.insert(attributes), values(attributes))
                .then((result) => {
                if (!(result === null || result === void 0 ? void 0 : result.insertId)) {
                    throw new Error('Insert operation failed');
                }
                return this.find(result === null || result === void 0 ? void 0 : result.insertId);
            })
                .catch((error) => {
                throw new Error(error);
            });
        });
    }
    update(attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeSql(this.query.update(attributes), values(attributes))
                .then((result) => (result === null || result === void 0 ? void 0 : result.rowsAffected) !== 0)
                .catch((error) => {
                throw new Error(error);
            });
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeSql(this.query.delete())
                .then((result) => !!(result === null || result === void 0 ? void 0 : result.insertId))
                .catch((error) => {
                throw new Error(error);
            });
        });
    }
    where(column, condition, value, boolean = 'and') {
        this.query.where(column, condition, value, boolean);
        return this;
    }
    select(columns = ['*']) {
        this.query.select(columns);
        return this;
    }
    executeBulkSql(statements, params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((txResolve, txReject) => {
                this.db.transaction((tx) => {
                    Promise.all(statements.map((sql, index) => {
                        return new Promise((sqlResolve, sqlReject) => {
                            tx.executeSql(sql, params[index], (_, result) => {
                                sqlResolve({
                                    rows: get(result.rows, '_array', []),
                                    rowsAffected: result.rowsAffected,
                                    insertId: result.insertId,
                                });
                            }, (_, error) => {
                                sqlReject(error);
                                return true;
                            });
                        });
                    }))
                        .then(txResolve)
                        .catch(txReject);
                });
            });
        });
    }
    executeSql(statement, params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeBulkSql([statement], [params])
                .then((results) => first(results))
                .catch((error) => {
                throw new Error(error);
            });
        });
    }
}
