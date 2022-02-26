import * as ESTree from 'estree'
import { EnvironmentState } from '../../environment/EnvironmentState'
import { applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { addVertex } from '../../execution/graph/graph'
import { bindAnimation } from '../../execution/primitive/Binding/BindAnimation'
import { ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { createScopeAnimation } from '../../execution/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../execution/primitive/Scope/PopScopeAnimation'
import { clone } from '../../utilities/objects'
import { getNodeData } from '../Compiler'
import { BlockStatement, ScopeType } from '../Statements/BlockStatement'

export function FunctionCall(
    ast: ESTree.FunctionDeclaration,
    environment: EnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    // Create a scope @TODO: HARD SCOPE
    const createScope = createScopeAnimation(ScopeType.Hard)
    addVertex(graph, createScope, { nodeData: getNodeData(ast) })
    applyExecutionNode(createScope, environment)

    // Bind arguments
    for (let i = 0; i < ast.params.length; i++) {
        const param = ast.params[i] as ESTree.Identifier
        const argRegister = context.args[i]

        const bind = bindAnimation(param.name, argRegister)
        addVertex(graph, bind, { nodeData: getNodeData(ast.params[i]) })
        applyExecutionNode(bind, environment)
    }

    // Call function
    const body = BlockStatement(ast.body, environment, { ...context, args: null }, ScopeType.None)
    addVertex(graph, body, { nodeData: getNodeData(ast) })

    // Pop scope
    const popScope = popScopeAnimation()
    addVertex(graph, popScope, { nodeData: getNodeData(ast) })
    applyExecutionNode(popScope, environment)

    graph.postcondition = clone(environment)
    return graph
}
