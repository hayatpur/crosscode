import * as ESTree from 'estree';
import { apply } from '../../animation/animation';
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex } from '../../animation/graph/graph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { bindAnimation } from '../../animation/primitive/Binding/BindAnimation';
import { moveAndPlaceAnimation } from '../../animation/primitive/Data/MoveAndPlaceAnimation';
import { AccessorType } from '../../environment/EnvironmentState';
import { ViewState } from '../../view/ViewState';
import { Compiler, getNodeData } from '../Compiler';

export function VariableDeclarator(ast: ESTree.VariableDeclarator, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    // Allocate a place for variable @TODO: support other initializations that identifier
    const bind = bindAnimation((ast.id as ESTree.Identifier).name);
    addVertex(graph, bind, getNodeData(ast.id));
    apply(bind, view);

    // Create a register to allocate RHS in
    const register = [{ type: AccessorType.Register, value: `${graph.id}__VariableDeclaration` }];

    // Copy / create and float it up RHS
    const init = Compiler.compile(ast.init, view, {
        ...context,
        locationHint: [{ type: AccessorType.Symbol, value: (ast.id as ESTree.Identifier).name }],
        outputRegister: register,
    });
    addVertex(graph, init, getNodeData(ast.init));

    // Place down the RHS
    const place = moveAndPlaceAnimation(
        register,
        [{ type: AccessorType.Symbol, value: (ast.id as ESTree.Identifier).name }],
        ast.init.type == 'Literal'
    );
    addVertex(graph, place, getNodeData(ast));
    apply(place, view);

    return graph;
}
