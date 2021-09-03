import * as ESTree from 'estree';
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex } from '../../animation/graph/graph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { ViewState } from '../../view/ViewState';
import { VariableDeclarator } from './VariableDeclarator';

export function VariableDeclaration(ast: ESTree.VariableDeclaration, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(this);

    for (const declaration of ast.declarations) {
        const animation = VariableDeclarator(declaration, view, context);
        addVertex(graph, animation);
    }

    return graph;
}
