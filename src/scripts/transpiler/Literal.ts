import * as ESTree from 'estree'
import { EnvironmentState } from '../environment/EnvironmentState'
import { applyExecutionNode } from '../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { addVertex } from '../execution/graph/graph'
import { createLiteralAnimation } from '../execution/primitive/Data/CreateLiteralAnimation'
import { ExecutionContext } from '../execution/primitive/ExecutionNode'
import { clone } from '../utilities/objects'
import { getNodeData } from './Compiler'

export function Literal(
    ast: ESTree.Literal,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const create = createLiteralAnimation(ast.value, context.outputRegister, context.locationHint)
    addVertex(graph, create, { nodeData: getNodeData(ast) })
    applyExecutionNode(create, environment)

    graph.postcondition = clone(environment)
    return graph
}
