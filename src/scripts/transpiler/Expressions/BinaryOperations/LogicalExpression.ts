import * as ESTree from 'estree'
import { apply } from '../../../animation/animation'
import { createAnimationGraph } from '../../../animation/graph/AnimationGraph'
import { addVertex } from '../../../animation/graph/graph'
import { AnimationContext } from '../../../animation/primitive/AnimationNode'
import { logicalExpressionEvaluate } from '../../../animation/primitive/Binary/LogicalExpressionEvaluate'
import { PrototypicalDataState } from '../../../environment/data/DataState'
import { resolvePath } from '../../../environment/environment'
import {
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import { Compiler, getNodeData } from '../../Compiler'

export function LogicalExpression(
    ast: ESTree.LogicalExpression,
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

    const left = Compiler.compile(ast.left, view, {
        ...context,
        outputRegister: leftRegister,
    })
    addVertex(graph, left, { nodeData: getNodeData(ast) })

    const environment = view
    const leftValue = resolvePath(
        environment,
        leftRegister,
        null
    ) as PrototypicalDataState

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
        const right = Compiler.compile(ast.right, view, {
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
    apply(evaluate, view)

    return graph
}
