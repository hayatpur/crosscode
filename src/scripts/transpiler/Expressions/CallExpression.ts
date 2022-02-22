import acorn = require('acorn')
import * as ESTree from 'estree'
import { PrototypicalDataState } from '../../environment/data/DataState'
import { cleanUpRegister, resolvePath } from '../../environment/environment'
import {
    Accessor,
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../environment/EnvironmentState'
import { applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { addVertex } from '../../execution/graph/graph'
import { consumeDataAnimation } from '../../execution/primitive/Data/ConsumeDataAnimation'
import {
    ControlOutput,
    ControlOutputData,
    ExecutionContext,
} from '../../execution/primitive/ExecutionNode'
import { ArrayPushAnimation } from '../../execution/primitive/Functions/Native/Array/ArrayPushAnimation'
import { clone } from '../../utilities/objects'
import { Compiler, getNodeData } from '../Compiler'
import { FunctionCall } from '../Functions/FunctionCall'

export function CallExpression(
    ast: ESTree.CallExpression,
    environment: PrototypicalEnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const controlOutput: ControlOutputData = { output: ControlOutput.None }

    const argGraph = createExecutionGraph({
        ...getNodeData(ast),
        type: 'Arguments',
    })
    argGraph.precondition = clone(environment)

    // Compile the arguments
    const registers: Accessor[][] = []
    for (let i = 0; i < ast.arguments.length; i++) {
        registers[i] = [
            {
                type: AccessorType.Register,
                value: `${graph.id}_${i}_CallExpression`,
            },
        ]
        const arg = Compiler.compile(ast.arguments[i], environment, {
            ...context,
            outputRegister: registers[i],
        })
        addVertex(argGraph, arg, { nodeData: getNodeData(ast.arguments[i]) })
    }

    argGraph.postcondition = clone(environment)
    addVertex(graph, argGraph, { nodeData: argGraph.nodeData })

    // Points to the location of the callee
    const lookupRegister = [
        {
            type: AccessorType.Register,
            value: `${graph.id}_LookupRegister`,
        },
    ]
    const lookup = Compiler.compile(ast.callee, environment, {
        feed: true,
        outputRegister: lookupRegister,
    })
    // addVertex(graph, lookup, { nodeData: getNodeData(ast.callee) })

    const lookupData = resolvePath(environment, lookupRegister, null) as PrototypicalDataState
    const lookupDataValue = lookupData.value as Function

    if (lookupDataValue.toString().includes('[native code]')) {
        let objectRegister: Accessor[]
        if (ast.callee.type === 'MemberExpression') {
            objectRegister = [
                {
                    type: AccessorType.Register,
                    value: `${graph.id}_ObjectRegister`,
                },
            ]
            const objectLookup = Compiler.compile(ast.callee.object, environment, {
                ...context,
                feed: false,
                outputRegister: objectRegister,
            })
            addVertex(graph, objectLookup, {
                nodeData: getNodeData(ast.callee.object),
            })
        } else {
            objectRegister = null
        }

        const nativeFunction = lookupNativeFunctionAnimation(lookupDataValue.name)(
            objectRegister,
            registers
        )
        addVertex(graph, nativeFunction, { nodeData: getNodeData(ast) })
        applyExecutionNode(nativeFunction, environment)
        if (objectRegister != null) {
            cleanUpRegister(environment, objectRegister[0].value)
        }

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
        const funcAST: ESTree.FunctionDeclaration = JSON.parse(lookupDataValue.toString())

        const body = FunctionCall(funcAST, environment, {
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

    // Cleanup
    cleanUpRegister(environment, lookupRegister[0].value)

    for (let i = 0; i < ast.arguments.length; i++) {
        const consume = consumeDataAnimation(registers[i])
        // addVertex(graph, consume, { nodeData: getNodeData(ast) })
        applyExecutionNode(consume, environment)
        cleanUpRegister(environment, registers[i][0].value)
    }

    graph.postcondition = clone(environment)
    return graph
}

export function lookupNativeFunctionAnimation(name: string) {
    return {
        push: ArrayPushAnimation,
    }[name]
}
