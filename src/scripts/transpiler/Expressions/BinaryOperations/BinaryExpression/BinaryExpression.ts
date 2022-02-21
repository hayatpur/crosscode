import * as ESTree from 'estree'
import { cleanUpRegister } from '../../../../environment/environment'
import {
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../../../environment/EnvironmentState'
import { applyExecutionNode } from '../../../../execution/execution'
import { createExecutionGraph } from '../../../../execution/graph/ExecutionGraph'
import { addVertex } from '../../../../execution/graph/graph'
import { binaryExpressionEvaluate } from '../../../../execution/primitive/Binary/BinaryExpressionEvaluate'
import { ExecutionContext } from '../../../../execution/primitive/ExecutionNode'
import { clone } from '../../../../utilities/objects'
import { Compiler, getNodeData } from '../../../Compiler'

export function BinaryExpression(
    ast: ESTree.BinaryExpression,
    environment: PrototypicalEnvironmentState,
    context: ExecutionContext
) {
    const graph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const leftRegister = [
        {
            type: AccessorType.Register,
            value: `${graph.id}_BinaryExpressionLeft`,
        },
    ]
    const rightRegister = [
        {
            type: AccessorType.Register,
            value: `${graph.id}_BinaryExpressionRight`,
        },
    ]

    const left = Compiler.compile(ast.left, environment, {
        ...context,
        outputRegister: leftRegister,
    })
    addVertex(graph, left, { nodeData: getNodeData(ast.left, 'left') })

    const right = Compiler.compile(ast.right, environment, {
        ...context,
        outputRegister: rightRegister,
    })
    addVertex(graph, right, { nodeData: getNodeData(ast.right, 'right') })

    const evaluate = binaryExpressionEvaluate(
        leftRegister,
        rightRegister,
        ast.operator,
        context.outputRegister
    )
    addVertex(graph, evaluate, { nodeData: getNodeData(ast, 'operator') })
    applyExecutionNode(evaluate, environment)

    cleanUpRegister(environment, leftRegister[0].value)
    cleanUpRegister(environment, rightRegister[0].value)

    graph.postcondition = clone(environment)
    return graph
}
