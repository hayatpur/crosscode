import * as ESTree from 'estree'
import { clone } from '../../../../utilities/objects'
import { addVertex, applyExecutionNode } from '../../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { moveAndPlaceAnimation } from '../../../execution/primitive/Data/MoveAndPlaceAnimation'
import { ExecutionContext } from '../../../execution/primitive/ExecutionNode'
import { Compiler, getNodeData } from '../../Compiler'
import { cleanUpRegister } from '../../environment'
import { AccessorType, EnvironmentState } from '../../EnvironmentState'

export function AssignmentExpression(
    ast: ESTree.AssignmentExpression,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const leftRegister = [{ type: AccessorType.Register, value: `${graph.id}_Assignment_Left` }]
    const rightRegister = [{ type: AccessorType.Register, value: `${graph.id}_Assignment_Right` }]

    // Put the *location* of the LHS in the left register
    const left = Compiler.compile(ast.left, environment, {
        ...context,
        outputRegister: leftRegister,
        feed: true,
    })
    addVertex(graph, left, { nodeData: getNodeData(ast.left, 'AssignmentIdentifier') })

    // RHS should be in the  stack
    const right = Compiler.compile(ast.right, environment, {
        ...context,
        outputRegister: rightRegister,
    })
    addVertex(graph, right, { nodeData: getNodeData(ast.right) })

    const place = moveAndPlaceAnimation(rightRegister, leftRegister)
    addVertex(graph, place, { nodeData: getNodeData(ast.left, 'AssignmentEquals') })
    applyExecutionNode(place, environment)

    cleanUpRegister(environment, leftRegister[0].value)
    cleanUpRegister(environment, rightRegister[0].value)

    graph.postcondition = clone(environment)
    return graph
}
