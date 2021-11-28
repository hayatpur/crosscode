import * as ESTree from 'estree'
import { createAnimationGraph } from '../../animation/graph/AnimationGraph'
import { addVertex } from '../../animation/graph/graph'
import { AnimationContext, ControlOutput } from '../../animation/primitive/AnimationNode'
import { RootViewState } from '../../view/ViewState'
import { Compiler, getNodeData } from '../Compiler'

export function Program(ast: ESTree.Program, view: RootViewState, context: AnimationContext) {
    const graph = createAnimationGraph(getNodeData(ast))

    const controlOutput = { output: ControlOutput.None }

    // Add blocks
    for (const statement of ast.body) {
        const animation = Compiler.compile(statement, view, { ...context, controlOutput })
        addVertex(graph, animation, { nodeData: getNodeData(statement) })
    }

    return graph
}
