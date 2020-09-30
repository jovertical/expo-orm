import { WebSQLDatabase } from 'expo-sqlite'
import { get } from 'lodash'

interface Where {
  column: string
  condition: ConditionalOperator
  value: ValidValue
  boolean: LogicalOperator
}

type ConditionalOperator = '=' | '!=' | '>' | '>=' | '<' | '<='
type ValidValue = number | string | null
type LogicalOperator = 'and' | 'or' | 'not'

export default class QueryBuilder {
  private db: WebSQLDatabase

  /**
   * The table which the query is targeting.
   */
  private table?: string

  /**
   * The where constraints for the query.
   */
  private wheres: Where[] = []

  /**
   * Create a new query builder instance.
   */
  constructor(db: WebSQLDatabase, table: string) {
    this.db = db
    this.table = table
  }

  /**
   * Perform a select * query.
   */
  public selectAll(): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `select * from ${this.table}`,
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

  /**
   * Perform an insert query.
   */
  public insert(attributes: Object): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        const fields = Object.keys(attributes).join(',')
        const placeholder = Object.keys(attributes)
          .map(() => '?')
          .join(',')

        tx.executeSql(
          `insert into ${this.table} (${fields}) values (${placeholder})`,
          Object.values(attributes),
          (_, result) => {
            resolve(result.insertId !== undefined)
          },
          (_, error) => {
            reject(error)
            return true
          },
        )
      })
    })
  }

  /**
   * Perform a delete query.
   */
  public delete(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          [`delete from ${this.table}`, this.buildWhere()].join(' '),
          [],
          (_, result) => {
            resolve(result.insertId !== undefined)
          },
          (_, error) => {
            reject(error)
            return true
          },
        )
      })
    })
  }

  /**
   * Add a basic where clause to the query.
   */
  public where(
    column: string,
    condition: ConditionalOperator,
    value: ValidValue,
    boolean: LogicalOperator = 'and',
  ): QueryBuilder {
    this.wheres = [...this.wheres, { column, condition, value, boolean }]
    return this
  }

  /**
   * Build an array of wheres to an sql compatible query.
   */
  private buildWhere(): string {
    return this.wheres
      .map((where, index) =>
        [
          index > 0 ? where.boolean : '',
          'where',
          where.column,
          where.condition,
          where.value,
        ].join(' '),
      )
      .join()
  }
}
