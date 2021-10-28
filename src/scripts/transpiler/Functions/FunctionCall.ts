import * as ESTree from 'estree';
import { apply } from '../../animation/animation';
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex } from '../../animation/graph/graph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { bindAnimation } from '../../animation/primitive/Binding/BindAnimation';
import { createScopeAnimation } from '../../animation/primitive/Scope/CreateScopeAnimation';
import { popScopeAnimation } from '../../animation/primitive/Scope/PopScopeAnimation';
import { ViewState } from '../../view/ViewState';
import { Compiler, getNodeData } from '../Compiler';

export function FunctionCall(ast: ESTree.FunctionDeclaration, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    // Create a scope @TODO: HARD SCOPE
    const createScope = createScopeAnimation();
    addVertex(graph, createScope, { nodeData: getNodeData(ast) });
    apply(createScope, view);

    // Bind arguments
    for (let i = 0; i < ast.params.length; i++) {
        const param = ast.params[i] as ESTree.Identifier;
        const argRegister = context.args[i];

        const bind = bindAnimation(param.name, argRegister);
        addVertex(graph, bind, { nodeData: getNodeData(ast.params[i]) });
        apply(bind, view);
    }

    // Call function
    const body = Compiler.compile(ast.body, view, { ...context, args: null });
    addVertex(graph, body, { nodeData: getNodeData(ast) });

    // Pop scope
    const popScope = popScopeAnimation();
    addVertex(graph, popScope, { nodeData: getNodeData(ast) });
    apply(popScope, view);

    return graph;
}
