import * as ESTree from 'estree'
import { AnimationContext } from '../../animation/primitive/AnimationNode'
import { RootViewState } from '../../view/ViewState'
import { Compiler } from '../Compiler'

export function ExpressionStatement(ast: ESTree.ExpressionStatement, view: RootViewState, context: AnimationContext) {
    return Compiler.compile(ast.expression, view, context)
}
