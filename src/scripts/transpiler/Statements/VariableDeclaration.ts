import * as ESTree from 'estree'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { addVertex } from '../../execution/graph/graph'
import { ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { clone } from '../../utilities/objects'
import { getNodeData } from '../Compiler'
import { VariableDeclarator } from './VariableDeclarator'

export function VariableDeclaration(
    ast: ESTree.VariableDeclaration,
    environment: PrototypicalEnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    for (const declaration of ast.declarations) {
        const animation = VariableDeclarator(declaration, environment, context)
        addVertex(graph, animation, { nodeData: getNodeData(declaration) })
    }

    graph.postcondition = clone(environment)
    return graph
}
