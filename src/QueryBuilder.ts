import { WebSQLDatabase } from 'expo-sqlite'
import { get, first } from 'lodash'
import { wrap } from './helpers'

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
   * The columns to be selected.
   */
  private columns: string[] = ['*']

  /**
   * Create a new query builder instance.
   */
  constructor(db: WebSQLDatabase, table: string) {
    this.db = db
    this.table = table
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
   * Perform an update query.
   */
  public update(attributes: Object): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        const placeholder = Object.keys(attributes)
          .map((column) => `${wrap(column, '`')} = ?`)
          .join(', ')

        tx.executeSql(
          ['update', this.table, 'set', placeholder, this.buildWhere()].join(
            ' ',
          ),
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
          `delete from ${this.table} ${this.buildWhere()}`,
          [],
          (_, result) => {
            resolve(get(result.rows.item(0), 'rowsAffected') > 0)
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
   * Execute the query and get all results.
   */
  public get(): Promise<Array<Object>> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          [
            'select',
            this.columns.join(', '),
            'from',
            this.table,
            this.buildWhere(),
          ].join(' '),
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
   * Execute the query and get the first result.
   */
  public first() {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          [
            'select',
            this.columns.join(', '),
            'from',
            this.table,
            this.buildWhere(),
            'limit ?',
          ].join(' '),
          [1],
          (_, result) => {
            const results = get(result.rows, '_array', [])
            resolve(first(results))
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
   * Set the columns to be selected.
   */
  public select(columns: string[] = ['*']): QueryBuilder {
    this.columns = columns
    return this
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
          wrap(where.column, '`'),
          where.condition,
          where.value,
        ].join(' '),
      )
      .join()
  }
}
