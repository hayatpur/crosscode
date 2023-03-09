import * as ESTree from 'estree'
import { clone } from '../../../../utilities/objects'
import { addVertex, applyExecutionNode } from '../../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { updateAnimation } from '../../../execution/primitive/Data/UpdateAnimation'
import { ExecutionContext } from '../../../execution/primitive/ExecutionNode'
import { Compiler, getNodeData } from '../../Compiler'
import { cleanUpRegister } from '../../environment'
import { AccessorType, EnvironmentState } from '../../EnvironmentState'

export function UpdateExpression(
    ast: ESTree.UpdateExpression,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const argRegister = [{ type: AccessorType.Register, value: `${graph.id}_UpdateExpr` }]

    // Put the *location* of argument in a register
    const argument = Compiler.compile(ast.argument, environment, {
        ...context,
        outputRegister: argRegister,
        feed: true,
    })
    addVertex(graph, argument, { nodeData: getNodeData(ast.argument) })

    if (context.outputRegister != null) {
        // Return a copy of it before applying update
        const output = Compiler.compile(ast.argument, environment, {
            ...context,
            outputRegister: context.outputRegister,
            feed: false,
        })
        addVertex(graph, output, { nodeData: getNodeData(ast.argument) })
    }

    // Apply the operation
    const update = updateAnimation(argRegister, ast.operator)
    addVertex(graph, update, { nodeData: getNodeData(ast.argument) })
    applyExecutionNode(update, environment)

    cleanUpRegister(environment, argRegister[0].value)

    graph.postcondition = clone(environment)
    return graph
}
