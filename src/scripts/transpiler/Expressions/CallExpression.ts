import acorn = require('acorn')
import * as ESTree from 'estree'
import { apply } from '../../animation/animation'
import {
    AnimationGraph,
    createAnimationGraph,
} from '../../animation/graph/AnimationGraph'
import { addVertex } from '../../animation/graph/graph'
import {
    AnimationContext,
    ControlOutput,
    ControlOutputData,
} from '../../animation/primitive/AnimationNode'
import { consumeDataAnimation } from '../../animation/primitive/Data/ConsumeDataAnimation'
import { PrototypicalDataState } from '../../environment/data/DataState'
import { resolvePath } from '../../environment/environment'
import {
    Accessor,
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../environment/EnvironmentState'
import { Compiler, getNodeData } from '../Compiler'
import { FunctionCall } from '../Functions/FunctionCall'

export function CallExpression(
    ast: ESTree.CallExpression,
    view: PrototypicalEnvironmentState,
    context: AnimationContext
) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast))

    const argGraph = createAnimationGraph({
        ...getNodeData(ast),
        type: 'Arguments',
    })

    // Compile the arguments
    const registers: Accessor[][] = []
    for (let i = 0; i < ast.arguments.length; i++) {
        registers[i] = [
            {
                type: AccessorType.Register,
                value: `${graph.id}_${i}_CallExpression`,
            },
        ]
        const arg = Compiler.compile(ast.arguments[i], view, {
            ...context,
            outputRegister: registers[i],
        })
        addVertex(argGraph, arg, { nodeData: getNodeData(ast.arguments[i]) })
    }

    addVertex(graph, argGraph, { nodeData: argGraph.nodeData })

    const controlOutput: ControlOutputData = { output: ControlOutput.None }

    if (ast.callee.type === 'Identifier') {
        const funcLocation = [
            { type: AccessorType.Symbol, value: ast.callee.name },
        ]
        const environment = view
        const funcData = resolvePath(
            environment,
            funcLocation,
            `${graph.id}_CallExpressionFunc`
        ) as PrototypicalDataState
        const funcAST: ESTree.FunctionDeclaration = JSON.parse(
            funcData.value as string
        )

        const body = FunctionCall(funcAST, view, {
            ...context,
            args: registers,
            outputRegister: [],
            returnData: {
                register: context.outputRegister,
                frame: environment.scope.length - 1,
                environmentId: environment.id,
            },
            controlOutput,
        })
        addVertex(graph, body, { nodeData: getNodeData(ast) })
    }

    // Consumption
    const consumption = createAnimationGraph({
        ...getNodeData(ast),
        type: 'Consume',
    })

    // Consume arguments
    for (let i = 0; i < ast.arguments.length; i++) {
        const consume = consumeDataAnimation(registers[i])
        addVertex(consumption, consume, { nodeData: getNodeData(ast) })
        apply(consume, view)
    }

    addVertex(graph, consumption, {
        nodeData: {
            ...getNodeData(ast),
            type: 'Consume',
        },
    })

    return graph
}
