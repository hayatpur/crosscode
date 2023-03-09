import * as ESTree from 'estree'
import { clone } from '../../../utilities/objects'
import { addVertex, applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { bindAnimation } from '../../execution/primitive/Binding/BindAnimation'
import { ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { createScopeAnimation } from '../../execution/primitive/Scope/CreateScopeAnimation'
import { popScopeAnimation } from '../../execution/primitive/Scope/PopScopeAnimation'
import { getNodeData } from '../Compiler'
import { EnvironmentState } from '../EnvironmentState'
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
    // addVertex(graph, createScope, { nodeData: getNodeData(ast) })
    applyExecutionNode(createScope, environment)

    // Bind arguments
    const args: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    args.precondition = clone(environment)

    for (let i = 0; i < ast.params.length; i++) {
        const param = ast.params[i] as ESTree.Identifier
        const argRegister = context.args[i]

        const bind = bindAnimation(param.name, argRegister)
        addVertex(args, bind, { nodeData: getNodeData(ast.params[i]) })
        applyExecutionNode(bind, environment)
    }
    args.postcondition = clone(environment)

    // addVertex(graph, args, { nodeData: getNodeData(ast.params, 'Arguments') })

    // Call function
    const body = BlockStatement(ast.body, environment, { ...context, args: null }, ScopeType.None)
    addVertex(graph, body, { nodeData: getNodeData(ast.body, 'Body') })

    // Pop scope
    const popScope = popScopeAnimation()
    // addVertex(body, popScope, { nodeData: getNodeData(ast) })
    applyExecutionNode(popScope, environment)

    graph.postcondition = clone(environment)
    body.postcondition = clone(environment)
    return body
}
