import * as ESTree from 'estree';
import { apply } from '../../../animation/animation';
import { AnimationGraph, createAnimationGraph } from '../../../animation/graph/AnimationGraph';
import { addVertex } from '../../../animation/graph/graph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import { moveAndPlaceAnimation } from '../../../animation/primitive/Data/MoveAndPlaceAnimation';
import { AccessorType } from '../../../environment/EnvironmentState';
import { ViewState } from '../../../view/ViewState';
import { Compiler, getNodeData, getSpecifier } from '../../Compiler';

export function AssignmentExpression(ast: ESTree.AssignmentExpression, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    const register = [{ type: AccessorType.Register, value: `${graph.id}_Assignment` }];

    // @TODO: Member expression assignment
    const leftSpecifier = getSpecifier(ast.left);

    // Right should be in the floating stack
    const right = Compiler.compile(ast.right, view, {
        ...context,
        locationHint: leftSpecifier,
        outputRegister: register,
    });
    addVertex(graph, right, getNodeData(ast.right));

    const place = moveAndPlaceAnimation(register, leftSpecifier, ast.right.type == 'Literal');
    addVertex(graph, place, getNodeData(ast));
    apply(place, view);

    return graph;
}
