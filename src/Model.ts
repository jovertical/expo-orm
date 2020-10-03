import Database from './Database'
import { get, pick } from 'lodash'

export default abstract class Model {
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

    const record = await instance.newDatabase().find(id, instance.primaryKey)

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

    return this.newDatabase().insert(pick(this, this.fillable))
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
   * Get the database connection to use
   */
  protected static connection() {
    throw new Error('Failed to open database connection')
  }

  /**
   * Create a new database connection
   */
  protected newDatabase(): Database {
    return Database.connect((this as any).connection).table(this.table)
  }
}
