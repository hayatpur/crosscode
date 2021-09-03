import * as ESTree from 'estree';
import { apply } from '../animation/animation';
import { createAnimationGraph } from '../animation/graph/AnimationGraph';
import { addVertex } from '../animation/graph/graph';
import { AnimationContext } from '../animation/primitive/AnimationNode';
import { copyDataAnimation } from '../animation/primitive/Data/CopyDataAnimation';
import { ViewState } from '../view/ViewState';
import { getNodeData, getSpecifier } from './Compiler';

export function Identifier(ast: ESTree.Identifier, view: ViewState, context: AnimationContext) {
    const graph = createAnimationGraph(getNodeData(ast));

    // Create a copy of it
    const copy = copyDataAnimation(getSpecifier(ast), context.outputRegister);
    addVertex(graph, copy, getNodeData(ast));
    apply(copy, view);

    return graph;
}
