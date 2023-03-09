import * as ESTree from 'estree'
import { clone } from '../../../utilities/objects'
import { addVertex, applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { consumeDataAnimation } from '../../execution/primitive/Data/ConsumeDataAnimation'
import { ControlOutput, ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { returnStatementAnimation } from '../../execution/primitive/Functions/ReturnStatementAnimation'
import { Compiler, getNodeData } from '../Compiler'
import { cleanUpRegister } from '../environment'
import { Accessor, AccessorType, EnvironmentState } from '../EnvironmentState'

export function ReturnStatement(ast: ESTree.ReturnStatement, environment: EnvironmentState, context: ExecutionContext) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    // Evaluate the result of argument into register

    let usingTemp = false
    let returnRegister: Accessor[] = context.returnData.register

    if (context.returnData.register == null) {
        // Temp return register
        returnRegister = [
            {
                type: AccessorType.Register,
                value: `${graph.id}_TempReturnRegister`,
            },
        ]

        usingTemp = true
    }

    const argument = Compiler.compile(ast.argument, environment, {
        ...context,
        outputRegister: returnRegister,
    })
    addVertex(graph, argument, { nodeData: getNodeData(ast.argument) })

    // Make sure the memory this register is pointing at doesn't get destroyed
    // when popping scopes
    if (usingTemp) {
        context.returnData.register = returnRegister
    }
    const ret = returnStatementAnimation(context.returnData)
    addVertex(graph, ret, { nodeData: { ...getNodeData(ast), type: 'ReturnStatementAnimation' } })
    applyExecutionNode(ret, environment)

    // Cleanup temp return
    if (usingTemp) {
        const consume = consumeDataAnimation(returnRegister)
        // addVertex(graph, consume, { nodeData: getNodeData(ast) })
        applyExecutionNode(consume, environment)
        cleanUpRegister(environment, returnRegister[0].value)

        context.returnData.register = null
    }

    // const special = createExecutionNode({
    //     ...getNodeData(ast),
    //     type: 'ReturnSpecial',
    //     preLabel: 'ReturnSpecial',
    // })
    // special._reads = [
    //     {
    //         location: context.returnData.register,
    //         value: 'return',
    //     },
    // ]
    // special._writes = []
    // special.precondition = clone(environment)
    // special.postcondition = clone(environment)

    // addVertex(graph, special, { nodeData: getNodeData(ast) })

    // TODO: Does this need a move and place?
    // const place = moveAndPlaceAnimation(register, context.returnData.register);
    // addVertex(graph, place, getNodeData(ast));
    //applyExecution(place, view);

    context.controlOutput.output = ControlOutput.Return

    graph.postcondition = clone(environment)
    return graph
}
