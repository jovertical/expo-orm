import Database from './Database'
import { get } from 'lodash'

export default abstract class Model {
  /**
   * The database connection to use
   */
  protected static connection = 'database.db'

  /**
   * The table associated with the model
   */
  protected static table?: string

  /**
   * Create a new constructor instance
   */
  constructor(attributes: Object) {
    this.fill(attributes)
  }

  /**
   * The primary key for the model
   */
  protected static primaryKey = 'id'

  /**
   * Find a model by its primary key
   */
  public static async find(id: number | string): Promise<Model | null> {
    const result = await Database.connection(this.connection, this.table).find(
      id,
      this.primaryKey,
    )

    if (!result) {
      return null
    }

    return Reflect.construct(this, [result])
  }

  /**
   * Fill the model with an array of attributes
   */
  protected fill(attributes: Object) {
    for (const attribute of Object.keys(attributes)) {
      ;(this as any)[attribute] = get(attributes, attribute, null)
    }
  }
}
