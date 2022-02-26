import * as ESTree from 'estree'
import { EnvironmentState } from '../../environment/EnvironmentState'
import { applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { addVertex } from '../../execution/graph/graph'
import { ControlOutput, ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { returnStatementAnimation } from '../../execution/primitive/Functions/ReturnStatementAnimation'
import { clone } from '../../utilities/objects'
import { Compiler, getNodeData } from '../Compiler'

export function ReturnStatement(
    ast: ESTree.ReturnStatement,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    // Evaluate the result of argument into register
    const argument = Compiler.compile(ast.argument, environment, {
        ...context,
        outputRegister: context.returnData.register,
    })
    addVertex(graph, argument, { nodeData: getNodeData(ast.argument) })

    // Make sure the memory this register is pointing at doesn't get destroyed
    // when popping scopes
    const ret = returnStatementAnimation(context.returnData)
    // addVertex(graph, ret, { nodeData: getNodeData(ast) })
    applyExecutionNode(ret, environment)

    // TODO: Does this need a move and place?
    // const place = moveAndPlaceAnimation(register, context.returnData.register);
    // addVertex(graph, place, getNodeData(ast));
    //applyExecution(place, view);

    context.controlOutput.output = ControlOutput.Return

    graph.postcondition = clone(environment)
    return graph
}
