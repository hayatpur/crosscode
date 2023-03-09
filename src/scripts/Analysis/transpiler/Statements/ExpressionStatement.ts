import * as ESTree from 'estree'
import { ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { Compiler } from '../Compiler'
import { EnvironmentState } from '../EnvironmentState'

export function ExpressionStatement(
    ast: ESTree.ExpressionStatement,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    return Compiler.compile(ast.expression, environment, context)
}
