import * as ESTree from 'estree'
import { DataState } from '../../../environment/data/DataState'
import { cleanUpRegister, resolvePath } from '../../../environment/environment'
import { AccessorType, EnvironmentState } from '../../../environment/EnvironmentState'
import { applyExecutionNode } from '../../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { addVertex } from '../../../execution/graph/graph'
import {
    ControlOutput,
    ControlOutputData,
    ExecutionContext,
} from '../../../execution/primitive/ExecutionNode'
import { createScopeAnimation } from '../../../execution/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../../execution/primitive/Scope/PopScopeAnimation'
import { clone } from '../../../utilities/objects'
import { Compiler, getNodeData } from '../../Compiler'

export function WhileStatement(
    ast: ESTree.WhileStatement,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    // Create a scope
    const createScope = createScopeAnimation()
    addVertex(graph, createScope, { nodeData: getNodeData(ast) })
    applyExecutionNode(createScope, environment)

    let _i = 0

    // Loop
    while (true) {
        // Test
        const testRegister = [{ type: AccessorType.Register, value: `${graph.id}_TestIf${_i}` }]
        const test = Compiler.compile(ast.test, environment, {
            ...context,
            outputRegister: testRegister,
        })
        addVertex(graph, test, { nodeData: getNodeData(ast.test) })
        const testData = resolvePath(environment, testRegister, null) as DataState // @TODO: Add a probe test animation
        const testValue = testData.value as boolean
        cleanUpRegister(environment, testRegister[0].value)
        if (!testValue) break

        // Body
        const controlOutput: ControlOutputData = { output: ControlOutput.None }
        const body = Compiler.compile(ast.body, environment, {
            ...context,
            controlOutput: controlOutput,
        })
        addVertex(graph, body, { nodeData: getNodeData(ast.body) })

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
        _i++
    }

    if (context.controlOutput.output != ControlOutput.Return) {
        context.controlOutput.output = ControlOutput.None
    }

    // Pop scope
    const popScope = popScopeAnimation()
    addVertex(graph, popScope, { nodeData: getNodeData(ast) })
    applyExecutionNode(popScope, environment)

    graph.postcondition = clone(environment)
    return graph
}
