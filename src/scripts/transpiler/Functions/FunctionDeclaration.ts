import * as ESTree from 'estree';
import { apply } from '../../animation/animation';
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex } from '../../animation/graph/graph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { bindFunctionAnimation } from '../../animation/primitive/Binding/BindFunctionAnimation';
import { ViewState } from '../../view/ViewState';
import { getNodeData } from '../Compiler';

export function FunctionDeclaration(ast: ESTree.FunctionDeclaration, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    // Allocate a place for variable that *points* to the register @TODO: support other initializations that identifier
    const bind = bindFunctionAnimation((ast.id as ESTree.Identifier).name, ast);
    addVertex(graph, bind, getNodeData(ast.id));
    apply(bind, view);

    // const FunctionCallInstance = (ast: ESTree.FunctionDeclaration, view: ViewState, context: AnimationContext) => {
    //     const subScope = createScopeAnimation();

    //     for (let i = 0; i < params.length; i++) {
    //         const param = params[i] as ESTree.Identifier;
    //         const environment = getCurrentEnvironment(view);
    //         const bind = bindAnimation(param.name, context.args[i], subScope);
    //     }
    // };

    return graph;
}
