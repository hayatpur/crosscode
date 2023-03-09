import * as ESTree from 'estree'
import { clone } from '../../utilities/objects'
import { addVertex, applyExecutionNode } from '../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { createLiteralAnimation } from '../execution/primitive/Data/CreateLiteralAnimation'
import { ExecutionContext } from '../execution/primitive/ExecutionNode'
import { getNodeData } from './Compiler'
import { EnvironmentState } from './EnvironmentState'

export function Literal(ast: ESTree.Literal, environment: EnvironmentState, context: ExecutionContext) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const create = createLiteralAnimation(ast.value, context.outputRegister, context.locationHint)
    addVertex(graph, create, { nodeData: getNodeData(ast) })
    applyExecutionNode(create, environment)

    graph.postcondition = clone(environment)
    return graph
}
