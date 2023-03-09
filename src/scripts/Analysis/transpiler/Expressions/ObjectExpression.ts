import { generate } from 'astring'
import * as ESTree from 'estree'
import { clone } from '../../../utilities/objects'
import { addVertex, applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { objectStartAnimation } from '../../execution/primitive/Container/ObjectStartAnimation'
import { moveAndPlaceAnimation } from '../../execution/primitive/Data/MoveAndPlaceAnimation'
import { ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { Compiler, getNodeData } from '../Compiler'
import { cleanUpRegister } from '../environment'
import { AccessorType, EnvironmentState } from '../EnvironmentState'

export function ObjectExpression(
    ast: ESTree.ObjectExpression,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    const start = objectStartAnimation(context.outputRegister)
    addVertex(graph, start, { nodeData: getNodeData(ast, 'start') })
    applyExecutionNode(start, environment)

    for (let i = 0; i < ast.properties.length; i++) {
        const property = ast.properties[i]
        if (property.type === 'SpreadElement') {
            throw new Error("Spread elements aren't supported yet")
        }

        const register = [
            {
                type: AccessorType.Register,
                value: `${graph.id}_ArrayExpression_${i}`,
            },
        ]

        // Object element
        const animation = Compiler.compile(property.value, environment, {
            ...context,
            outputRegister: register,
        })
        addVertex(graph, animation, {
            nodeData: getNodeData(property.value, `${property.key}`),
        })

        const place = moveAndPlaceAnimation(register, [
            ...context.outputRegister,
            { type: AccessorType.Index, value: generate(property.key) },
        ])
        addVertex(graph, place, { nodeData: getNodeData(property) })
        applyExecutionNode(place, environment)

        cleanUpRegister(environment, register[0].value)
    }

    graph.postcondition = clone(environment)
    return graph
}
