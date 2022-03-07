import * as ESTree from 'estree'
import { cleanUpRegister } from '../../../environment/environment'
import { AccessorType, EnvironmentState } from '../../../environment/EnvironmentState'
import { addVertex, applyExecutionNode } from '../../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { arrayStartAnimation } from '../../../execution/primitive/Container/ArrayStartAnimation'
import { moveAndPlaceAnimation } from '../../../execution/primitive/Data/MoveAndPlaceAnimation'
import { ExecutionContext } from '../../../execution/primitive/ExecutionNode'
import { clone } from '../../../utilities/objects'
import { Compiler, getNodeData } from '../../Compiler'

export function ArrayExpression(
    ast: ESTree.ArrayExpression,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const start = arrayStartAnimation(context.outputRegister)
    addVertex(graph, start, { nodeData: getNodeData(ast, 'start') })
    applyExecutionNode(start, environment)

    for (let i = 0; i < ast.elements.length; i++) {
        // Create a register that'll point to the RHS
        const register = [
            {
                type: AccessorType.Register,
                value: `${graph.id}_ArrayExpression_${i}`,
            },
        ]

        // Array element
        const animation = Compiler.compile(ast.elements[i], environment, {
            ...context,
            outputRegister: register,
        })
        addVertex(graph, animation, { nodeData: getNodeData(ast.elements[i], `element ${i}`) })

        const place = moveAndPlaceAnimation(register, [
            ...context.outputRegister,
            { type: AccessorType.Index, value: i.toString() },
        ])
        addVertex(graph, place, { nodeData: getNodeData(ast.elements[i]) })
        applyExecutionNode(place, environment)

        cleanUpRegister(environment, register[0].value)
    }

    // const end = arrayEndAnimation(context.outputRegister);
    // addVertex(graph, end, getNodeData(ast));
    // applyExecution(end, view);

    graph.postcondition = clone(environment)
    return graph
}
