import { wrap } from './helpers'

export default class QueryBuilder {
  /**
   * The where constraints for the query.
   */
  private wheres: Where[] = []

  /**
   * The columns to be selected.
   */
  private columns: string[] = ['*']

  /**
   * The table which the query is targeting
   */
  private table: string

  /**
   * Create a new query builder instance
   */
  constructor(table: string) {
    this.table = table
  }

  public insert(attributes: Object): string {
    const fields = Object.keys(attributes).join(', ')
    const placeholder = Object.keys(attributes)
      .map(() => '?')
      .join(', ')

    return `insert into ${this.table} (${fields}) values (${placeholder})`
  }

  public update(attributes: Object): string {
    const placeholder = Object.keys(attributes)
      .map((column) => `${wrap(column, '`')} = ?`)
      .join(', ')

    return `update ${this.table} set ${placeholder} ${this.buildWhere()}`
  }

  public delete(): string {
    return `delete from ${wrap(this.table, '`')} ${this.buildWhere()}`
  }

  public get(): string {
    return [
      'select',
      this.columns.join(', '),
      'from',
      wrap(this.table, '`'),
      this.buildWhere(),
    ].join(' ')
  }

  public find(): string {
    return [
      'select',
      this.columns.join(', '),
      'from',
      wrap(this.table, '`'),
      'where id = ?',
      'limit 1;',
    ].join(' ')
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
          where.value,
        ].join(' '),
      )
      .join('')
  }
}
