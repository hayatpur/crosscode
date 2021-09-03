import * as ESTree from 'estree';
import { apply } from '../animation/animation';
import { AnimationGraph, createAnimationGraph } from '../animation/graph/AnimationGraph';
import { addVertex } from '../animation/graph/graph';
import { AnimationContext } from '../animation/primitive/AnimationNode';
import { createLiteralAnimation } from '../animation/primitive/Data/CreateLiteralAnimation';
import { ViewState } from '../view/ViewState';
import { getNodeData } from './Compiler';

export function Literal(ast: ESTree.Literal, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    const create = createLiteralAnimation(ast.value, context.outputRegister, context.locationHint);
    addVertex(graph, create, getNodeData(ast));
    apply(create, view);

    return graph;
}
