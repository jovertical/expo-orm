import Builder from './Builder'
import Model from './Model'
import { isString } from 'lodash'

export default class ModelBuilder {
  /**
   * The base query builder
   */
  private query: Builder

  /**
   * The model being queried
   */
  private model!: Model

  /**
   * The relationships that should be eager loaded
   */
  private relations: string[] = []

  /**
   * Create a new model builder instance
   */
  constructor(builder: Builder) {
    this.query = builder
  }

  /**
   * Set the relationships that should be eager loaded
   */
  public with(relations: string[] | string): ModelBuilder {
    this.relations = isString(relations) ? [relations] : relations
    return this
  }

  /**
   * Set the model being queried
   */
  public setModel(model: Model): ModelBuilder {
    this.model = model
    return this.registerModelEvents()
  }

  /**
   * Register events for the given model
   */
  public registerModelEvents(): ModelBuilder {
    this.query.onInsert = (attributes: Object, setAttributes: Function) => {
      if (this.model.timestamps) {
        setAttributes({ created_at: new Date().toISOString() })
      }
    }

    this.query.onUpdate = (attributes: Object, setAttributes: Function) => {
      if (this.model.timestamps) {
        setAttributes({ updated_at: new Date().toISOString() })
      }
    }

    return this
  }

  /**
   * Get the base query builder
   */
  public getQuery(): Builder {
    return this.query
  }
}
