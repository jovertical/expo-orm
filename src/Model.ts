import Builder from './Builder'
import Database from './Database'
import ModelBuilder from './ModelBuilder'
import { get, pick } from 'lodash'

export default abstract class Model {
  protected connection = 'database.db'

  protected table!: string

  protected primaryKey = 'id'

  protected fillable: string[] = []

  public timestamps = true

  constructor(attributes?: Object) {
    this.fill(attributes)
  }

  public static async find(id: number | string): Promise<Model | null> {
    const instance = this.newInstance()

    const record = await instance.query().find(id, instance.primaryKey)

    return record ? this.newInstance().fill(record) : null
  }

  public static async create(attributes: Object): Promise<Model | null> {
    const instance = this.newInstance(attributes)

    const saved = await instance.save()

    return saved ? this.find(saved) : null
  }

  public static where(
    column: string,
    condition: ConditionalOperator,
    value: ValidValue,
    boolean: LogicalOperator = 'and',
  ): Builder {
    return this.newInstance().query().where(column, condition, value, boolean)
  }

  public static with(relations: string[] | string): Builder {
    return this.newInstance().newModelQuery().with(relations).getQuery()
  }

  public static async get(): Promise<Object[]> {
    const instance = this.newInstance()
    return instance.query().get()
  }

  public static newInstance(attributes?: Object): Model {
    return Reflect.construct(this, [attributes])
  }

  public async save(): Promise<number | null> {
    // Check if saving an existing record, update the model instead
    return this.query().insert(pick(this, this.fillable))
  }

  public getTable(): string {
    return this.table
  }

  public fill(attributes?: Object): Model {
    if (attributes) {
      for (const attribute of Object.keys(attributes)) {
        ;(this as any)[attribute] = get(attributes, attribute, null)
      }
    }

    return this
  }

  public toJson(): Object {
    return pick(this, [
      ...this.fillable,
      this.primaryKey,
      'created_at',
      'updated_at',
    ])
  }

  protected query(): Builder {
    return this.newModelQuery().getQuery()
  }

  private newModelQuery(): ModelBuilder {
    return new ModelBuilder(this.newQuery()).setModel(this)
  }

  private newQuery(): Builder {
    const database = this.newDatabase()
    return new Builder(database).setFrom(this.table)
  }

  private newDatabase(): Database {
    return Database.connect(this.connection)
  }
}
