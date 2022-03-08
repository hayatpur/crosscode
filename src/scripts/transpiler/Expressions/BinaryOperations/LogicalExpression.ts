import * as ESTree from 'estree'
import { cleanUpRegister, resolvePath } from '../../../environment/environment'
import { AccessorType, EnvironmentState } from '../../../environment/EnvironmentState'
import { addVertex, applyExecutionNode } from '../../../execution/execution'
import { createExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { logicalExpressionEvaluate } from '../../../execution/primitive/Binary/LogicalExpressionEvaluate'
import { ExecutionContext } from '../../../execution/primitive/ExecutionNode'
import { DataState } from '../../../renderer/View/Environment/data/DataState'
import { clone } from '../../../utilities/objects'
import { Compiler, getNodeData } from '../../Compiler'

export function LogicalExpression(
    ast: ESTree.LogicalExpression,
    environment: EnvironmentState,
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

    const left = Compiler.compile(ast.left, environment, {
        ...context,
        outputRegister: leftRegister,
    })
    addVertex(graph, left, { nodeData: getNodeData(ast) })

    const leftValue = resolvePath(environment, leftRegister, null) as DataState

    let shortCircuit = false

    // Short circuit
    if (ast.operator == '&&' && leftValue.value == false) {
        shortCircuit = true
    } else if (ast.operator == '||' && leftValue.value == true) {
        shortCircuit = true
    }

    const rightRegister = [
        {
            type: AccessorType.Register,
            value: `${graph.id}_BinaryExpressionRight`,
        },
    ]

    if (!shortCircuit) {
        const right = Compiler.compile(ast.right, environment, {
            ...context,
            outputRegister: rightRegister,
        })
        addVertex(graph, right, { nodeData: getNodeData(ast) })
    }

    const evaluate = logicalExpressionEvaluate(
        leftRegister,
        rightRegister,
        shortCircuit,
        ast.operator,
        context.outputRegister
    )

    addVertex(graph, evaluate, { nodeData: getNodeData(ast) })
    applyExecutionNode(evaluate, environment)

    cleanUpRegister(environment, leftRegister[0].value)
    cleanUpRegister(environment, rightRegister[0].value)

    graph.postcondition = clone(environment)
    return graph
}
