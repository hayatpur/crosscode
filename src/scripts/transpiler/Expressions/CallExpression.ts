import * as ESTree from 'estree'
import { cleanUpRegister, resolvePath } from '../../environment/environment'
import { Accessor, AccessorType, EnvironmentState } from '../../environment/EnvironmentState'
import { addVertex, applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { consumeDataAnimation } from '../../execution/primitive/Data/ConsumeDataAnimation'
import {
    ControlOutput,
    ControlOutputData,
    ExecutionContext,
    ExecutionNode,
} from '../../execution/primitive/ExecutionNode'
import { ArrayConcatAnimation } from '../../execution/primitive/Functions/Native/Array/ArrayConcatAnimation'
import { ArrayPushAnimation } from '../../execution/primitive/Functions/Native/Array/ArrayPushAnimation'
import { FloorAnimation } from '../../execution/primitive/Functions/Native/Math/FloorAnimation'
import { SqrtAnimation } from '../../execution/primitive/Functions/Native/Math/SqrtAnimation'
import { DataState } from '../../renderer/View/Environment/data/DataState'
import { clone } from '../../utilities/objects'
import { Compiler, getNodeData } from '../Compiler'
import { FunctionCall } from '../Functions/FunctionCall'

export function CallExpression(ast: ESTree.CallExpression, environment: EnvironmentState, context: ExecutionContext) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const controlOutput: ControlOutputData = { output: ControlOutput.None }

    const argGraph = createExecutionGraph({
        ...getNodeData(ast.arguments, 'Arguments'),
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

    let lookupDataValue: any
    let lookupRegister: Accessor[] = null
    let staticObject = false

    let bodyGraph: ExecutionGraph | ExecutionNode = null

    // Special case for in-built functions
    if (
        ast.callee.type == 'MemberExpression' &&
        ast.callee.object.type == 'Identifier' &&
        ast.callee.object.name == 'Math'
    ) {
        lookupDataValue = {
            name: (ast.callee.property as ESTree.Identifier).name,
            toString: () => '[native code]',
        }
        staticObject = true
    } else {
        // Points to the location of the callee
        lookupRegister = [
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
        lookupDataValue = lookupData.value as Function
    }

    if (lookupDataValue.toString().includes('[native code]')) {
        let objectRegister: Accessor[]
        if (ast.callee.type === 'MemberExpression' && !staticObject) {
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
            // console.log(resolvePath(environment, objectRegister, null))
            // addVertex(graph, objectLookup, {
            //     nodeData: getNodeData(ast.callee.object),
            // })
        } else {
            objectRegister = null
        }

        const nativeFunction = lookupNativeFunctionAnimation(lookupDataValue.name)(
            objectRegister,
            registers,
            context.outputRegister
        )

        bodyGraph = nativeFunction
        addVertex(graph, nativeFunction, { nodeData: getNodeData(ast) })
        applyExecutionNode(nativeFunction, environment)
        if (objectRegister != null) {
            cleanUpRegister(environment, objectRegister[0].value)
        }
    } else {
        const funcAST: ESTree.FunctionDeclaration = JSON.parse(lookupDataValue.toString())

        const body = FunctionCall(funcAST, environment, {
            ...context,
            args: registers,
            outputRegister: [],
            returnData: {
                register: context.outputRegister.length > 0 ? context.outputRegister : null,
                frame: environment.scope.length,
                environmentID: environment.id,
            },
            controlOutput,
        })
        bodyGraph = body
        addVertex(graph, body, {
            nodeData: {
                ...getNodeData(funcAST, 'Function Call'),
                type: 'FunctionCall',
            },
        })
    }

    argGraph.postcondition = clone(bodyGraph.precondition)

    // Cleanup
    if (lookupRegister != null) {
        cleanUpRegister(environment, lookupRegister[0].value)
    }

    const ret = resolvePath(environment, context.outputRegister, null) as DataState

    for (let i = 0; i < ast.arguments.length; i++) {
        // Make sure that the things being cleaned up is not a return value
        const resolve = resolvePath(environment, registers[i], null) as DataState

        if (ret.id == resolve.id) {
            continue
        }

        const consume = consumeDataAnimation(registers[i])
        applyExecutionNode(consume, environment)
        cleanUpRegister(environment, registers[i][0].value)
    }

    // const retAnimation = createExecutionNode({
    //     ...getNodeData(ast.callee, 'ReturnAnimationSpecial'),
    //     preLabel: `ReturnAnimationSpecial_${ret.id}`,
    // })
    // retAnimation.postcondition = clone(environment)

    // TODO ... why is this here?
    // if (instanceOfExecutionGraph(bodyGraph) && bodyGraph.vertices.length > 1) {
    //     graph.vertices[0].postcondition = clone(bodyGraph.vertices[0].postcondition)
    // }

    graph.postcondition = clone(environment)
    graph.nodeData.type = 'CallExpression'

    return graph
}

export function lookupNativeFunctionAnimation(name: string) {
    return {
        push: ArrayPushAnimation,
        concat: ArrayConcatAnimation,
        floor: FloorAnimation,
        sqrt: SqrtAnimation,
        // split: SplitAnimation,
    }[name]
}
