import Builder from './Builder'
import Model from './Model'
import { isString } from 'lodash'

export default class ModelBuilder {
  private query: Builder

  private model!: Model

  private relations: string[] = []

  constructor(builder: Builder) {
    this.query = builder
  }

  public with(relations: string[] | string): ModelBuilder {
    this.relations = isString(relations) ? [relations] : relations
    return this
  }

  public setModel(model: Model): ModelBuilder {
    this.model = model
    return this.registerModelEvents()
  }

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

  public getQuery(): Builder {
    return this.query
  }
}
