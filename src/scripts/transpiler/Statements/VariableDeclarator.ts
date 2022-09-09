import * as ESTree from 'estree'
import { cleanUpRegister } from '../../environment/environment'
import { AccessorType, EnvironmentState } from '../../environment/EnvironmentState'
import { addVertex, applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { bindAnimation } from '../../execution/primitive/Binding/BindAnimation'
import { ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { clone } from '../../utilities/objects'
import { Compiler, getNodeData } from '../Compiler'

export function VariableDeclarator(
    ast: ESTree.VariableDeclarator,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    // Create a register that'll point to the RHS
    const register = [
        {
            type: AccessorType.Register,
            value: `${graph.id}__VariableDeclaration`,
        },
    ]

    // Copy / create and float up RHS
    const init = Compiler.compile(ast.init, environment, {
        ...context,
        outputRegister: register,
    })
    addVertex(graph, init, { nodeData: getNodeData(ast.init, 'Value') })

    // Allocate a place for variable that *points* to the RHS
    // @TODO: support initializations other than identifier
    const bind = bindAnimation((ast.id as ESTree.Identifier).name, register)
    const bindNodeData = getNodeData(ast.id, 'Name')
    bindNodeData.location.start.column -= 4

    addVertex(graph, bind, { nodeData: bindNodeData })
    applyExecutionNode(bind, environment)
    cleanUpRegister(environment, register[0].value)

    graph.postcondition = clone(environment)
    return graph
}
