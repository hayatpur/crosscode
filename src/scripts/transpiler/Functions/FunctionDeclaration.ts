import * as ESTree from 'estree'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { applyExecutionNode } from '../../execution/execution'
import { createExecutionGraph, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { bindFunctionAnimation } from '../../execution/primitive/Binding/BindFunctionAnimation'
import { ExecutionContext } from '../../execution/primitive/ExecutionNode'
import { clone } from '../../utilities/objects'
import { getNodeData } from '../Compiler'

export function FunctionDeclaration(
    ast: ESTree.FunctionDeclaration,
    environment: PrototypicalEnvironmentState,
    context: ExecutionContext
) {
    const graph: ExecutionGraph = createExecutionGraph(getNodeData(ast))
    graph.precondition = clone(environment)

    // Allocate a place for variable that *points* to the register @TODO: support other initializations that identifier
    const bind = bindFunctionAnimation((ast.id as ESTree.Identifier).name, ast)
    // addVertex(graph, bind, { nodeData: getNodeData(ast.id) })
    applyExecutionNode(bind, environment)

    // const FunctionCallInstance = (ast: ESTree.FunctionDeclaration, environment: PrototypicalEnvironmentState, context: ExecutionContext) => {
    //     const subScope = createScopeAnimation();

    //     for (let i = 0; i < params.length; i++) {
    //         const param = params[i] as ESTree.Identifier;
    //
    //         const bind = bindAnimation(param.name, context.args[i], subScope);
    //     }
    // };

    graph.postcondition = clone(environment)
    return graph
}
