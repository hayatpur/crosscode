import * as ESTree from 'estree'
import {
    AnimationGraph,
    createAnimationGraph,
} from '../../animation/graph/AnimationGraph'
import { addVertex } from '../../animation/graph/graph'
import { AnimationContext } from '../../animation/primitive/AnimationNode'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { getNodeData } from '../Compiler'
import { VariableDeclarator } from './VariableDeclarator'

export function VariableDeclaration(
    ast: ESTree.VariableDeclaration,
    view: PrototypicalEnvironmentState,
    context: AnimationContext
) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast))

    for (const declaration of ast.declarations) {
        const animation = VariableDeclarator(declaration, view, context)
        addVertex(graph, animation, { nodeData: getNodeData(declaration) })
    }

    return graph
}
