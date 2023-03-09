import * as ESTree from 'estree'
import { DataState } from '../../../../DataView/Environment/data/DataState'
import { clone } from '../../../../utilities/objects'
import { addVertex, applyExecutionNode } from '../../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { consumeDataAnimation } from '../../../execution/primitive/Data/ConsumeDataAnimation'
import { ControlOutput, ControlOutputData, ExecutionContext } from '../../../execution/primitive/ExecutionNode'
import { createScopeAnimation } from '../../../execution/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../../execution/primitive/Scope/PopScopeAnimation'

import { Compiler, getNodeData } from '../../Compiler'
import { cleanUpRegister, resolvePath } from '../../environment'
import { AccessorType, EnvironmentState } from '../../EnvironmentState'

export function ForStatement(ast: ESTree.ForStatement, environment: EnvironmentState, context: ExecutionContext) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    // Create a scope
    const createScope = createScopeAnimation()
    // addVertex(graph, createScope, { nodeData: getNodeData(ast, 'Create Scope') })
    applyExecutionNode(createScope, environment)

    // let iteration = createExecutionGraph({
    //     ...getNodeData(ast),
    //     type: 'ForStatementIteration',
    // })
    // iteration.precondition = clone(environment)

    // Init
    const init = Compiler.compile(ast.init, environment, context)
    addVertex(graph, init, { nodeData: getNodeData(ast.init, 'Initial') })

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
        addVertex(graph, test, { nodeData: getNodeData(ast.test, 'Test') })

        const testData = resolvePath(environment, testRegister, null) as DataState
        const testValue = testData.value as boolean

        // Consume testData
        const consume = consumeDataAnimation(testRegister)
        applyExecutionNode(consume, environment)
        cleanUpRegister(environment, testRegister[0].value)

        if (!testValue) {
            graph.postcondition = clone(environment)
            break
        }

        // Body
        const controlOutput: ControlOutputData = { output: ControlOutput.None }
        const body = Compiler.compile(ast.body, environment, {
            ...context,
            controlOutput: controlOutput,
        })

        addVertex(graph, body, { nodeData: getNodeData(ast.body, 'Body') })

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
        addVertex(graph, update, { nodeData: getNodeData(ast.update, 'Update') })

        // Add iteration to the graph
        // iteration.postcondition = clone(environment)
        // addVertex(graph, iteration, {
        //     nodeData: {
        //         ...getNodeData(ast, `Iteration ${_i}`),
        //         type: 'ForStatementIteration',
        //     },
        // })

        // iteration = createExecutionGraph({
        //     ...getNodeData(ast),
        //     type: 'ForStatementIteration',
        // })
        // iteration.precondition = clone(environment)

        _i++
    }

    if (context.controlOutput.output != ControlOutput.Return) {
        context.controlOutput.output = ControlOutput.None
    }

    // Pop scope
    const popScope = popScopeAnimation()
    // addVertex(graph, popScope, { nodeData: getNodeData(ast, 'Pop Scope') })
    applyExecutionNode(popScope, environment)

    graph.postcondition = clone(environment)
    return graph
}
