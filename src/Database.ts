import { WebSQLDatabase } from 'expo-sqlite/src/SQLite.types'
import { get, first, values } from 'lodash'
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
  private connection: WebSQLDatabase

  /**
   * The query builder
   */
  private query!: QueryBuilder

  /**
   * Create a new database instance
   */
  constructor(connection: WebSQLDatabase) {
    this.connection = connection
  }

  /**
   * Set the database connection
   */
  public static connect(db: WebSQLDatabase): Database {
    return new Database(db)
  }

  /**
   * Set the table which the query is targeting
   */
  public table(name: string): Database {
    this.query = new QueryBuilder(name)

    return this
  }

  public async get(): Promise<Array<any>> {
    return this.executeSql(this.query.get())
      .then((result) => result?.rows || [])
      .catch((error) => {
        throw new Error(error)
      })
  }

  public async find(
    id: number | string,
    column = 'id',
  ): Promise<Object | undefined> {
    return this.executeSql(this.query.find(column), [id])
      .then((result) => first(result?.rows))
      .catch((error) => {
        throw new Error(error)
      })
  }

  public async insert(attributes: Object): Promise<number | null> {
    return this.executeSql(this.query.insert(attributes), values(attributes))
      .then((result) => result?.insertId || null)
      .catch((error) => {
        throw new Error(error)
      })
  }

  public async update(attributes: Object): Promise<boolean> {
    return this.executeSql(this.query.update(attributes), values(attributes))
      .then((result) => result?.rowsAffected !== 0)
      .catch((error) => {
        throw new Error(error)
      })
  }

  public async delete(): Promise<boolean> {
    return this.executeSql(this.query.delete())
      .then((result) => result?.rowsAffected !== 0)
      .catch((error) => {
        throw new Error(error)
      })
  }

  public where(
    column: string,
    condition: ConditionalOperator,
    value: ValidValue,
    boolean: LogicalOperator = 'and',
  ): Database {
    this.query.where(column, condition, value, boolean)
    return this
  }

  public select(columns: string[] = ['*']): Database {
    this.query.select(columns)
    return this
  }

  private async executeBulkSql(
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

  private async executeSql(
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
