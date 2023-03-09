import * as ESTree from 'estree'
import { clone } from '../../../../utilities/objects'
import { addVertex, applyExecutionNode } from '../../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionContext } from '../../../execution/primitive/ExecutionNode'
import { unaryExpressionEvaluate } from '../../../execution/primitive/Unary/UnaryExpressionEvaluate'
import { Compiler, getNodeData } from '../../Compiler'
import { cleanUpRegister } from '../../environment'
import { AccessorType, EnvironmentState } from '../../EnvironmentState'

export function UnaryExpression(ast: ESTree.UnaryExpression, environment: EnvironmentState, context: ExecutionContext) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const argRegister = [{ type: AccessorType.Register, value: `${graph.id}_UpdateExpr` }]

    const argument = Compiler.compile(ast.argument, environment, {
        ...context,
        outputRegister: argRegister,
    })
    addVertex(graph, argument, { nodeData: getNodeData(ast.argument) })

    const evaluate = unaryExpressionEvaluate(argRegister, ast.operator, context.outputRegister)
    addVertex(graph, evaluate, { nodeData: getNodeData(ast, 'Evaluate') })
    applyExecutionNode(evaluate, environment)

    cleanUpRegister(environment, argRegister[0].value)

    graph.postcondition = clone(environment)
    return graph
}
