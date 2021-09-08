import * as ESTree from 'estree';
import { apply } from '../../../animation/animation';
import { AnimationGraph, createAnimationGraph } from '../../../animation/graph/AnimationGraph';
import { addVertex } from '../../../animation/graph/graph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import { moveAndPlaceAnimation } from '../../../animation/primitive/Data/MoveAndPlaceAnimation';
import { AccessorType } from '../../../environment/EnvironmentState';
import { ViewState } from '../../../view/ViewState';
import { Compiler, getNodeData } from '../../Compiler';

export function AssignmentExpression(ast: ESTree.AssignmentExpression, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    const leftRegister = [{ type: AccessorType.Register, value: `${graph.id}_Assignment_Left` }];
    const rightRegister = [{ type: AccessorType.Register, value: `${graph.id}_Assignment_Right` }];

    // Put the *location* of the LHS in the left register
    Compiler.compile(ast.left, view, { ...context, outputRegister: leftRegister, feed: true });

    // Right should be in the floating stack
    const right = Compiler.compile(ast.right, view, {
        ...context,
        outputRegister: rightRegister,
    });
    addVertex(graph, right, getNodeData(ast.right));

    const place = moveAndPlaceAnimation(rightRegister, leftRegister, ast.right.type == 'Literal');
    addVertex(graph, place, getNodeData(ast));
    apply(place, view);

    return graph;
}
