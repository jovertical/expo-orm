import Builder from './Builder'
import Database from './Database'
import ModelBuilder from './ModelBuilder'
import { get, pick } from 'lodash'

export default abstract class Model {
  /**
   * The database connection to use
   */
  protected connection = 'database.db'

  /**
   * The table associated with the model
   */
  protected table!: string

  /**
   * The primary key for the model
   */
  protected primaryKey = 'id'

  /**
   * The attributes that are mass assignable
   */
  protected fillable: string[] = []

  /**
   * Indicates if the model should be timestamped
   */
  public timestamps = true

  /**
   * Create a new model instance
   */
  constructor(attributes?: Object) {
    this.fill(attributes)
  }

  /**
   * Find a model by its primary key
   */
  public static async find(id: number | string): Promise<Model | null> {
    const instance = this.newInstance()

    const record = await instance.query().find(id, instance.primaryKey)

    return record ? this.newInstance().fill(record) : null
  }

  /**
   * Save a new model and return the instance
   */
  public static async create(attributes: Object): Promise<Model | null> {
    const instance = this.newInstance(attributes)

    const saved = await instance.save()

    return saved ? this.find(saved) : null
  }

  /**
   * Begin querying a model with where
   */
  public static where(
    column: string,
    condition: ConditionalOperator,
    value: ValidValue,
    boolean: LogicalOperator = 'and',
  ): Builder {
    return this.newInstance().query().where(column, condition, value, boolean)
  }

  /**
   * Begin querying a model with eager loading
   */
  public static with(relations: string[] | string): Builder {
    return this.newInstance().newModelQuery().with(relations).getQuery()
  }

  public static async get(): Promise<Object[]> {
    const instance = this.newInstance()
    return instance.query().get()
  }

  /**
   * Create a new instance of the given model
   */
  public static newInstance(attributes?: Object): Model {
    return Reflect.construct(this, [attributes])
  }

  /**
   * Save the model to the database
   */
  public async save(): Promise<number | null> {
    // Check if saving an existing record, update the model instead
    return this.query().insert(pick(this, this.fillable))
  }

  /**
   * Get the table associated with the model
   */
  public getTable(): string {
    return this.table
  }

  /**
   * Fill the model with an array of attributes
   */
  public fill(attributes?: Object): Model {
    if (attributes) {
      for (const attribute of Object.keys(attributes)) {
        ;(this as any)[attribute] = get(attributes, attribute, null)
      }
    }

    return this
  }

  /**
   * Convert the model attributes to it's JSON form
   */
  public toJson(): Object {
    return pick(this, [...this.fillable, this.primaryKey])
  }

  /**
   * Create a new query builder instance
   */
  protected query(): Builder {
    return this.newModelQuery().getQuery()
  }

  /**
   * Create a new model builder instance
   */
  private newModelQuery(): ModelBuilder {
    return new ModelBuilder(this.newQuery()).setModel(this)
  }

  /**
   * Create a new builder instance
   */
  private newQuery(): Builder {
    const database = this.newDatabase()
    return new Builder(database).setFrom(this.table)
  }

  /**
   * Create a new database connection
   */
  private newDatabase(): Database {
    return Database.connect(this.connection)
  }
}
