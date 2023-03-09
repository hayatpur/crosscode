import * as ESTree from 'estree'
import { DataState, instanceOfObjectData } from '../../DataView/Environment/data/DataState'
import { clone } from '../../utilities/objects'
import { addVertex, applyExecutionNode } from '../execution/execution'
import { createExecutionGraph } from '../execution/graph/ExecutionGraph'
import { copyDataAnimation } from '../execution/primitive/Data/CopyDataAnimation'
import { copyReferenceAnimation } from '../execution/primitive/Data/CopyReferenceAnimation'
import { findVariableAnimation } from '../execution/primitive/Data/FindVariableAnimation'
import { ExecutionContext } from '../execution/primitive/ExecutionNode'
import { getNodeData } from './Compiler'
import { resolvePath } from './environment'
import { AccessorType, EnvironmentState } from './EnvironmentState'

export function Identifier(ast: ESTree.Identifier, environment: EnvironmentState, context: ExecutionContext) {
    const graph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    if (context.feed) {
        // Feeding
        const reference = findVariableAnimation(ast.name, context.outputRegister)
        addVertex(graph, reference, { nodeData: getNodeData(ast) })
        applyExecutionNode(reference, environment)
    } else {
        const data = resolvePath(environment, [{ type: AccessorType.Symbol, value: ast.name }], null) as DataState

        if (instanceOfObjectData(data)) {
            // Create a reference to it
            const copyReference = copyReferenceAnimation(
                [{ type: AccessorType.Symbol, value: ast.name }],
                context.outputRegister
            )
            addVertex(graph, copyReference, { nodeData: getNodeData(ast) })
            applyExecutionNode(copyReference, environment)
        } else {
            // Create a copy of it
            const copy = copyDataAnimation([{ type: AccessorType.Symbol, value: ast.name }], context.outputRegister)
            addVertex(graph, copy, { nodeData: getNodeData(ast) })
            applyExecutionNode(copy, environment)
        }
    }

    graph.postcondition = clone(environment)
    return graph
}
