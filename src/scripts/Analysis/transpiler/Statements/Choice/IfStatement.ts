import * as ESTree from 'estree'
import { DataState } from '../../../../DataView/Environment/data/DataState'
import { clone } from '../../../../utilities/objects'
import { addVertex, applyExecutionNode } from '../../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { consumeDataAnimation } from '../../../execution/primitive/Data/ConsumeDataAnimation'
import { ControlOutput, ControlOutputData, ExecutionContext } from '../../../execution/primitive/ExecutionNode'

import { Compiler, getNodeData } from '../../Compiler'
import { cleanUpRegister, resolvePath } from '../../environment'
import { AccessorType, EnvironmentState } from '../../EnvironmentState'

export function IfStatement(ast: ESTree.IfStatement, environment: EnvironmentState, context: ExecutionContext) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    // Points to the result of the test
    const testRegister = [{ type: AccessorType.Register, value: `${graph.id}_TestIf` }]

    const test = Compiler.compile(ast.test, environment, {
        ...context,
        outputRegister: testRegister,
    })
    addVertex(graph, test, { nodeData: getNodeData(ast.test, 'Test') })

    // @TODO: Add a probe test animation
    const testData = resolvePath(environment, testRegister, null) as DataState
    const testValue = testData.value as boolean

    // Consume testData
    const consume = consumeDataAnimation(testRegister)
    // addVertex(graph, consume, { nodeData: getNodeData(ast) })
    applyExecutionNode(consume, environment)
    cleanUpRegister(environment, testRegister[0].value)

    const controlOutput: ControlOutputData = { output: ControlOutput.None }

    if (testValue) {
        // Execute the body
        const body = Compiler.compile(ast.consequent, environment, {
            ...context,
            controlOutput,
        })
        addVertex(graph, body, { nodeData: getNodeData(ast.consequent, 'Consequent') })
    } else if (ast.alternate != null) {
        // Execute the alternate (if any)
        const alternate = Compiler.compile(ast.alternate, environment, {
            ...context,
            controlOutput,
        })
        addVertex(graph, alternate, { nodeData: getNodeData(ast.alternate, 'Alternate') })
    }

    context.controlOutput.output = controlOutput.output

    graph.postcondition = clone(environment)
    return graph
}
