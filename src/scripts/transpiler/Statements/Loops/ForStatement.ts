import * as ESTree from 'estree'
import { PrototypicalDataState } from '../../../environment/data/DataState'
import { cleanUpRegister, resolvePath } from '../../../environment/environment'
import { AccessorType, PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { applyExecutionNode } from '../../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { addVertex } from '../../../execution/graph/graph'
import { consumeDataAnimation } from '../../../execution/primitive/Data/ConsumeDataAnimation'
import {
    ControlOutput,
    ControlOutputData,
    ExecutionContext,
} from '../../../execution/primitive/ExecutionNode'
import { createScopeAnimation } from '../../../execution/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../../execution/primitive/Scope/PopScopeAnimation'
import { clone } from '../../../utilities/objects'
import { Compiler, getNodeData } from '../../Compiler'

export function ForStatement(
    ast: ESTree.ForStatement,
    environment: PrototypicalEnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    // Create a scope
    const createScope = createScopeAnimation()
    addVertex(graph, createScope, { nodeData: getNodeData(ast, 'create scope') })
    applyExecutionNode(createScope, environment)

    let iteration = createExecutionGraph({
        ...getNodeData(ast),
        type: 'ForStatementIteration',
    })
    iteration.precondition = clone(environment)

    // Init
    const init = Compiler.compile(ast.init, environment, context)
    addVertex(iteration, init, { nodeData: getNodeData(ast.init, 'init') })

    // Points to the result of test

    let _i = 0
    // Loop
    while (true) {
        // Test
        const testRegister = [{ type: AccessorType.Register, value: `${graph.id}_TestIf${_i}` }]
        const test = Compiler.compile(ast.test, environment, {
            ...context,
            outputRegister: testRegister,
        })
        addVertex(iteration, test, { nodeData: getNodeData(ast.test, 'test') })

        const testData = resolvePath(environment, testRegister, null) as PrototypicalDataState
        const testValue = testData.value as boolean

        // Consume testData
        const consume = consumeDataAnimation(testRegister)
        addVertex(iteration, consume, { nodeData: getNodeData(ast) })
        applyExecutionNode(consume, environment)
        cleanUpRegister(environment, testRegister[0].value)

        if (!testValue) {
            addVertex(graph, iteration, {
                nodeData: {
                    ...getNodeData(ast),
                    type: 'ForStatementIteration',
                },
            })
            break
        }

        // Body
        const controlOutput: ControlOutputData = { output: ControlOutput.None }
        const body = Compiler.compile(ast.body, environment, {
            ...context,
            controlOutput: controlOutput,
        })

        addVertex(iteration, body, { nodeData: getNodeData(ast.body, 'body') })

        if (controlOutput.output == ControlOutput.Break) {
            context.controlOutput.output = ControlOutput.None
            break
        } else if (controlOutput.output == ControlOutput.Continue) {
            context.controlOutput.output = ControlOutput.None
        } else if (controlOutput.output == ControlOutput.Return) {
            context.controlOutput.output = ControlOutput.Return
            break
        }

        // Update
        const update = Compiler.compile(ast.update, environment, {
            ...context,
            outputRegister: null,
        })
        addVertex(iteration, update, { nodeData: getNodeData(ast.update, 'update') })

        // Add iteration to the graph
        iteration.postcondition = clone(environment)
        addVertex(graph, iteration, {
            nodeData: {
                ...getNodeData(ast, `iter ${_i}`),
                type: 'ForStatementIteration',
            },
        })

        iteration = createExecutionGraph({
            ...getNodeData(ast),
            type: 'ForStatementIteration',
        })
        iteration.precondition = clone(environment)

        _i++
    }

    if (context.controlOutput.output != ControlOutput.Return) {
        context.controlOutput.output = ControlOutput.None
    }

    // Pop scope
    const popScope = popScopeAnimation()
    addVertex(graph, popScope, { nodeData: getNodeData(ast, 'pop scope') })
    applyExecutionNode(popScope, environment)

    graph.postcondition = clone(environment)
    return graph
}
