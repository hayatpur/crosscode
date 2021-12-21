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
import { createScopeAnimation } from '../../animation/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../animation/primitive/Scope/PopScopeAnimation'
import { PrototypicalDataState } from '../../environment/data/DataState'
import { resolvePath } from '../../environment/environment'
import { Accessor, AccessorType } from '../../environment/EnvironmentState'
import { clone } from '../../utilities/objects'
import { RootViewState } from '../../view/ViewState'
import { Compiler, getNodeData } from '../Compiler'
import { FunctionCall } from '../Functions/FunctionCall'

export function CallExpression(
    ast: ESTree.CallExpression,
    view: RootViewState,
    context: AnimationContext
) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast))

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
        addVertex(graph, arg, { nodeData: getNodeData(ast.arguments[i]) })
    }

    const controlOutput: ControlOutputData = { output: ControlOutput.None }

    if (ast.callee.type === 'Identifier') {
        const funcLocation = [
            { type: AccessorType.Symbol, value: ast.callee.name },
        ]
        const environment = view.environment
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
    const consumption = createAnimationGraph(getNodeData(ast))

    // Consume arguments
    for (let i = 0; i < ast.arguments.length; i++) {
        console.log(clone(view), registers[i])
        const consume = consumeDataAnimation(registers[i])
        addVertex(consumption, consume, { nodeData: getNodeData(ast) })
        apply(consume, view)
    }

    addVertex(graph, consumption, { nodeData: getNodeData(ast) })

    return graph
}
