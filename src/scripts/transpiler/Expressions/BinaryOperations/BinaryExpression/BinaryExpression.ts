import * as ESTree from 'estree'
import { apply } from '../../../../animation/animation'
import { createAnimationGraph } from '../../../../animation/graph/AnimationGraph'
import { addVertex } from '../../../../animation/graph/graph'
import { AnimationContext } from '../../../../animation/primitive/AnimationNode'
import { binaryExpressionEvaluate } from '../../../../animation/primitive/Binary/BinaryExpressionEvaluate'
import {
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../../../environment/EnvironmentState'
import { Compiler, getNodeData } from '../../../Compiler'

export function BinaryExpression(
    ast: ESTree.BinaryExpression,
    view: PrototypicalEnvironmentState,
    context: AnimationContext
) {
    const graph = createAnimationGraph(getNodeData(ast))

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

    const left = Compiler.compile(ast.left, view, {
        ...context,
        outputRegister: leftRegister,
    })
    addVertex(graph, left, { nodeData: getNodeData(ast.left) })

    const right = Compiler.compile(ast.right, view, {
        ...context,
        outputRegister: rightRegister,
    })
    addVertex(graph, right, { nodeData: getNodeData(ast.right) })

    const evaluate = binaryExpressionEvaluate(
        leftRegister,
        rightRegister,
        ast.operator,
        context.outputRegister
    )
    addVertex(graph, evaluate, { nodeData: getNodeData(ast) })
    apply(evaluate, view)

    return graph
}
