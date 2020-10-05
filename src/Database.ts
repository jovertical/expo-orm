import * as SQLite from 'expo-sqlite'
import { get, first } from 'lodash'
import QueryBuilder from './QueryBuilder'

interface SqlResult {
  rows: Array<Object>
  rowsAffected: number
  insertId: number
}

export default class Database {
  /**
   * The database connection to use
   */
  private connection: SQLite.WebSQLDatabase

  /**
   * Create a new database instance
   */
  constructor(connection = 'database.db') {
    this.connection = SQLite.openDatabase(connection)
  }

  /**
   * Set the database connection to use
   */
  public static connect(name: string): Database {
    return new Database(name)
  }

  /**
   * Set the table which the query is targeting
   */
  public table(name: string): QueryBuilder {
    return new QueryBuilder(this).setFrom(name)
  }

  /**
   * Get the database connection to use
   */
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
