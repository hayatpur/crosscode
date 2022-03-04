import acorn = require('acorn')
import * as ESTree from 'estree'
import { DataState } from '../../environment/data/DataState'
import { cleanUpRegister, resolvePath } from '../../environment/environment'
import { Accessor, AccessorType, EnvironmentState } from '../../environment/EnvironmentState'
import { applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { addVertex } from '../../execution/graph/graph'
import { consumeDataAnimation } from '../../execution/primitive/Data/ConsumeDataAnimation'
import {
    ControlOutput,
    ControlOutputData,
    ExecutionContext,
} from '../../execution/primitive/ExecutionNode'
import { ArrayConcatAnimation } from '../../execution/primitive/Functions/Native/Array/ArrayConcatAnimation'
import { ArrayPushAnimation } from '../../execution/primitive/Functions/Native/Array/ArrayPushAnimation'
import { clone } from '../../utilities/objects'
import { Compiler, getNodeData } from '../Compiler'
import { FunctionCall } from '../Functions/FunctionCall'

export function CallExpression(
    ast: ESTree.CallExpression,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const controlOutput: ControlOutputData = { output: ControlOutput.None }

    const argGraph = createExecutionGraph({
        ...getNodeData(ast.arguments),
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
    const lookupData = resolvePath(environment, lookupRegister, null) as DataState
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
            registers,
            context.outputRegister
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
        //             resolvePath(view, object, null) as DataState
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
                register: context.outputRegister.length > 0 ? context.outputRegister : null,
                frame: environment.scope.length,
                environmentId: environment.id,
            },
            controlOutput,
        })
        addVertex(graph, body, { nodeData: { ...getNodeData(ast), type: 'Function Call' } })
    }

    // Cleanup
    cleanUpRegister(environment, lookupRegister[0].value)

    const ret = resolvePath(environment, context.outputRegister, null) as DataState

    for (let i = 0; i < ast.arguments.length; i++) {
        // Make sure that the things being cleaned up is not a return value
        const resolve = resolvePath(environment, registers[i], null) as DataState

        if (ret.id == resolve.id) {
            continue
        }

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
        concat: ArrayConcatAnimation,
    }[name]
}
