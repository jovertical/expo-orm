import { WebSQLDatabase } from 'expo-sqlite'
import { get } from 'lodash'

export default class QueryBuilder {
  private db: WebSQLDatabase

  /**
   * Create a new query builder instance.
   */
  constructor(db: WebSQLDatabase) {
    this.db = db
  }

  /**
   * Perform a select * query.
   */
  public selectAll(table: string): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `select * from ${table}`,
          [],
          (_, result) => {
            resolve(get(result.rows, '_array', []))
          },
          (_, error) => {
            reject(error)
            return true
          },
        )
      })
    })
  }
}
