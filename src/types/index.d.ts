interface Where {
  column: string
  condition: ConditionalOperator
  value: ValidValue
  boolean: LogicalOperator
}

type ConditionalOperator = '=' | '!=' | '>' | '>=' | '<' | '<='
type ValidValue = number | string | null
type LogicalOperator = 'and' | 'or' | 'not'
