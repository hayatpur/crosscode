import * as ESTree from 'estree'
import { apply } from '../../animation/animation'
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph'
import { addVertex } from '../../animation/graph/graph'
import { AnimationContext, ControlOutput, ControlOutputData } from '../../animation/primitive/AnimationNode'
import { createScopeAnimation } from '../../animation/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../animation/primitive/Scope/PopScopeAnimation'
import { RootViewState } from '../../view/ViewState'
import { Compiler, getNodeData } from '../Compiler'

/**
 * A block contains a sequence of one or more statements.
 * @param ast Block Statement AST
 * @param view ViewState state leading up to block statement
 * @param context
 * @returns {AnimationGraph} animation
 */
export function BlockStatement(
    ast: ESTree.BlockStatement,
    view: RootViewState,
    context: AnimationContext
): AnimationGraph {
    const graph = createAnimationGraph(getNodeData(ast))

    context.locationHint = []

    // Create a scope
    const createScope = createScopeAnimation()
    addVertex(graph, createScope, { nodeData: getNodeData(ast) })
    apply(createScope, view)

    // Add statements
    for (const statement of ast.body) {
        const controlOutput: ControlOutputData = { output: ControlOutput.None }

        const animation = Compiler.compile(statement, view, { ...context, controlOutput })
        addVertex(graph, animation, { nodeData: getNodeData(statement) })

        if (controlOutput.output == ControlOutput.Break) {
            // Keep propagating 'break' until reaching a ForStatement or WhileStatement
            context.controlOutput.output = ControlOutput.Break
            break
        } else if (controlOutput.output == ControlOutput.Continue) {
            // Keep propagating 'continue' until reaching a ForStatement or WhileStatement
            context.controlOutput.output = ControlOutput.Continue
            break
        } else if (controlOutput.output == ControlOutput.Return) {
            // Keep propagating 'return' until reaching a ForStatement or WhileStatement
            context.controlOutput.output = ControlOutput.Return
            break
        }
    }

    // Pop scope
    const popScope = popScopeAnimation()
    addVertex(graph, popScope, { nodeData: getNodeData(ast) })
    apply(popScope, view)

    return graph
}
