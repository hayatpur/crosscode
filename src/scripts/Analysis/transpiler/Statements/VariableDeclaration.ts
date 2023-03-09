import * as ESTree from 'estree'
import { clone } from '../../../utilities/objects'
import { addVertex } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { getNodeData } from '../Compiler'
import { EnvironmentState } from '../EnvironmentState'
import { VariableDeclarator } from './VariableDeclarator'

export function VariableDeclaration(
    ast: ESTree.VariableDeclaration,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    if (ast.declarations.length == 1) {
        return VariableDeclarator(ast.declarations[0], environment, context)
    }

    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    for (const declaration of ast.declarations) {
        const animation = VariableDeclarator(declaration, environment, context)
        addVertex(graph, animation, { nodeData: getNodeData(declaration, 'declaration') })
    }

    graph.postcondition = clone(environment)
    return graph
}
