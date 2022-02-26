import * as ESTree from 'estree'
import { EnvironmentState } from '../../environment/EnvironmentState'
import { ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { Compiler } from '../Compiler'

export function ExpressionStatement(
    ast: ESTree.ExpressionStatement,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    return Compiler.compile(ast.expression, environment, context)
}
