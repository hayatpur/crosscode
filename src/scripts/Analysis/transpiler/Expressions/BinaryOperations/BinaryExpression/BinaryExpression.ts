import * as ESTree from 'estree'
import { clone } from '../../../../../utilities/objects'
import { addVertex, applyExecutionNode } from '../../../../execution/execution'
import { createExecutionGraph } from '../../../../execution/graph/ExecutionGraph'
import { binaryExpressionEvaluate } from '../../../../execution/primitive/Binary/BinaryExpressionEvaluate'
import { ExecutionContext } from '../../../../execution/primitive/ExecutionNode'
import { Compiler, getNodeData } from '../../../Compiler'
import { cleanUpRegister } from '../../../environment'
import { AccessorType, EnvironmentState } from '../../../EnvironmentState'

export function BinaryExpression(
    ast: ESTree.BinaryExpression,
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

    addVertex(graph, left, { nodeData: getNodeData(ast.left, 'Left') })

    // Fix left position
    // if (left.nodeData.location != null && ast.loc != null) {
    //     // Put it at the start of the binary expression
    //     left.nodeData.location.start.column = ast.loc.start.column

    //     // Find how long the left is

    // }

    const right = Compiler.compile(ast.right, environment, {
        ...context,
        outputRegister: rightRegister,
    })
    addVertex(graph, right, { nodeData: getNodeData(ast.right, 'Right') })

    const evaluate = binaryExpressionEvaluate(leftRegister, rightRegister, ast.operator, context.outputRegister)

    const location = clone(ast.left.loc) as ESTree.SourceLocation
    location.end = (clone(ast.right.loc) as ESTree.SourceLocation).start
    location.start = (clone(ast.left.loc) as ESTree.SourceLocation).end

    addVertex(graph, evaluate, {
        nodeData: {
            ...getNodeData(ast, 'Evaluate'),
            type: 'BinaryExpressionEvaluate',
            location,
        },
    })
    applyExecutionNode(evaluate, environment)

    cleanUpRegister(environment, leftRegister[0].value)
    cleanUpRegister(environment, rightRegister[0].value)

    graph.postcondition = clone(environment)
    return graph
}
