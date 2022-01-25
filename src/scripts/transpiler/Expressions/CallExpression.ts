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
import { ArrayPushAnimation } from '../../animation/primitive/Functions/Native/Array/ArrayPushAnimation'
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
    const controlOutput: ControlOutputData = { output: ControlOutput.None }

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

    // Points to the location of the callee
    const lookupRegister = [
        {
            type: AccessorType.Register,
            value: `${graph.id}_LookupRegister`,
        },
    ]
    const lookup = Compiler.compile(ast.callee, view, {
        feed: true,
        outputRegister: lookupRegister,
    })
    addVertex(graph, lookup, { nodeData: getNodeData(ast.callee) })

    const lookupData = resolvePath(
        view,
        lookupRegister,
        null
    ) as PrototypicalDataState
    const lookupDataValue = lookupData.value as Function

    if (lookupDataValue.toString().includes('[native code]')) {
        let object: Accessor[]
        if (ast.callee.type === 'MemberExpression') {
            object = [
                {
                    type: AccessorType.Register,
                    value: `${graph.id}_ObjectRegister`,
                },
            ]
            const objectLookup = Compiler.compile(ast.callee.object, view, {
                ...context,
                feed: false,
                outputRegister: object,
            })
            addVertex(graph, objectLookup, {
                nodeData: getNodeData(ast.callee.object),
            })
        } else {
            object = null
        }

        const nativeFunction = lookupNativeFunctionAnimation(
            lookupDataValue.name
        )(object, registers)
        addVertex(graph, nativeFunction, { nodeData: getNodeData(ast) })
        apply(nativeFunction, view)

        // if (object != null) {
        //     removeAt(
        //         view,
        //         getMemoryLocation(
        //             view,
        //             resolvePath(view, object, null) as PrototypicalDataState
        //         ).foundLocation,
        //         {
        //             noResolvingReference: true,
        //         }
        //     )
        // }
    } else {
        const funcAST: ESTree.FunctionDeclaration = JSON.parse(
            lookupDataValue.toString()
        )

        const body = FunctionCall(funcAST, view, {
            ...context,
            args: registers,
            outputRegister: [],
            returnData: {
                register: context.outputRegister,
                frame: view.scope.length - 1,
                environmentId: view.id,
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

export function lookupNativeFunctionAnimation(name: string) {
    return {
        push: ArrayPushAnimation,
    }[name]
}
