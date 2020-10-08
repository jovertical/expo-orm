import * as SQLite from 'expo-sqlite'
import { get, first } from 'lodash'
import Builder from './Builder'

interface SqlResult {
  rows: Array<Object>
  rowsAffected: number
  insertId: number
}

export default class Database {
  private connection: SQLite.WebSQLDatabase

  constructor(connection = 'database.db') {
    this.connection = SQLite.openDatabase(connection)
  }

  public static connect(name: string): Database {
    return new Database(name)
  }

  public table(name: string): Builder {
    return new Builder(this).setFrom(name)
  }

  public getConnection(): SQLite.WebSQLDatabase {
    return this.connection
  }

  public async executeBulkSql(
    statements: string[],
    params: Array<any> = [],
  ): Promise<SqlResult[]> {
    return new Promise((txResolve: any, txReject) => {
      this.connection.transaction((tx) => {
        Promise.all(
          statements.map((sql, index) => {
            return new Promise((sqlResolve, sqlReject) => {
              tx.executeSql(
                sql,
                params[index],
                (_, result) => {
                  sqlResolve({
                    rows: get(result.rows, '_array', []),
                    rowsAffected: result.rowsAffected,
                    insertId: result.insertId,
                  })
                },
                (_, error) => {
                  sqlReject(error)
                  return true
                },
              )
            })
          }),
        )
          .then(txResolve)
          .catch(txReject)
      })
    })
  }

  public async executeSql(
    statement: string,
    params: Array<any> = [],
  ): Promise<SqlResult | undefined> {
    return this.executeBulkSql([statement], [params])
      .then((results) => first(results))
      .catch((error) => {
        throw new Error(error)
      })
  }
}
