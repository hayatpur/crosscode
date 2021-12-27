import * as ESTree from 'estree'
import { AnimationContext } from '../../animation/primitive/AnimationNode'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { Compiler } from '../Compiler'

export function ExpressionStatement(
    ast: ESTree.ExpressionStatement,
    view: PrototypicalEnvironmentState,
    context: AnimationContext
) {
    return Compiler.compile(ast.expression, view, context)
}
