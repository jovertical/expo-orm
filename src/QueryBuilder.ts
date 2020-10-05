import Database from './Database'
import { first, values } from 'lodash'
import { wrap } from './helpers'

export default class QueryBuilder {
  /**
   * The database instance
   */
  private database: Database

  /**
   * The table which the query is targeting
   */
  private from!: string

  /**
   * The where constraints for the query.
   */
  private wheres: Where[] = []

  /**
   * The columns to be selected.
   */
  private columns: string[] = ['*']

  /**
   * Create a new query builder instance
   */
  constructor(database: Database) {
    this.database = database
  }

  /**
   * Set the table which the query is targeting
   */
  public setFrom(from: string): QueryBuilder {
    this.from = from
    return this
  }

  public async insert(attributes: Object): Promise<number | null> {
    const fields = Object.keys(attributes).join(', ')
    const placeholder = Object.keys(attributes)
      .map(() => '?')
      .join(', ')

    return this.database
      .executeSql(
        `insert into ${this.from} (${fields}) values (${placeholder})`,
        values(attributes),
      )
      .then((result) => result?.insertId || null)
      .catch((error) => {
        throw new Error(error)
      })
  }

  public async update(attributes: Object): Promise<boolean> {
    const placeholder = Object.keys(attributes)
      .map((column) => `${wrap(column, '`')} = ?`)
      .join(', ')

    return this.database
      .executeSql(
        `update ${this.from} set ${placeholder} ${this.buildWhere()}`,
        values(attributes),
      )
      .then((result) => result?.rowsAffected !== 0)
      .catch((error) => {
        throw new Error(error)
      })
  }

  public async delete(): Promise<boolean> {
    return this.database
      .executeSql(`delete from ${wrap(this.from, '`')} ${this.buildWhere()}`)
      .then((result) => result?.rowsAffected !== 0)
      .catch((error) => {
        throw new Error(error)
      })
  }

  public async get() {
    return this.database
      .executeSql(
        [
          'select',
          this.columns.join(', '),
          'from',
          wrap(this.from, '`'),
          this.buildWhere(),
        ].join(' '),
      )
      .then((result) => result?.rows || [])
      .catch((error) => {
        throw new Error(error)
      })
  }

  public async first(): Promise<Object | null> {
    return this.database
      .executeSql(
        [
          'select',
          this.columns.join(', '),
          'from',
          wrap(this.from, '`'),
          this.buildWhere(),
          'limit 1;',
        ].join(' '),
      )
      .then((result) => first(result?.rows) || null)
      .catch((error) => {
        throw new Error(error)
      })
  }

  public async find(
    key: number | string,
    column = 'id',
  ): Promise<Object | undefined> {
    return this.database
      .executeSql(
        [
          'select',
          this.columns.join(', '),
          'from',
          wrap(this.from, '`'),
          `where ${column} = ?`,
          'limit 1;',
        ].join(' '),
        [key],
      )
      .then((result) => first(result?.rows))
      .catch((error) => {
        throw new Error(error)
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
   * Build the array of wheres as sql.
   */
  private buildWhere(): string {
    return this.wheres
      .map((where, index) =>
        [
          index > 0 ? where.boolean : '',
          'where',
          wrap(where.column, '`'),
          where.condition,
          wrap(where.value, "'"),
        ].join(' '),
      )
      .join('')
  }
}
