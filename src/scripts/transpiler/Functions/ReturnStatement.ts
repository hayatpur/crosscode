import * as ESTree from 'estree';
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex } from '../../animation/graph/graph';
import { AnimationContext, ControlOutput } from '../../animation/primitive/AnimationNode';
import { DataState } from '../../environment/data/DataState';
import { resolvePath } from '../../environment/environment';
import { getCurrentEnvironment } from '../../view/view';
import { ViewState } from '../../view/ViewState';
import { Compiler, getNodeData } from '../Compiler';

export function ReturnStatement(ast: ESTree.ReturnStatement, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    // Evaluate the result of argument into register
    const argument = Compiler.compile(ast.argument, view, {
        ...context,
        outputRegister: context.returnData.register,
    });
    addVertex(graph, argument, { nodeData: getNodeData(ast.argument) });

    // Make sure the memory this register is pointing at doesn't get destroyed
    // when popping scopes
    const environment = getCurrentEnvironment(view);
    const memory = resolvePath(environment, context.returnData.register, null) as DataState;
    memory.frame = context.returnData.frame;

    // TODO: Does this need a move and place?
    // const place = moveAndPlaceAnimation(register, context.returnData.register);
    // addVertex(graph, place, getNodeData(ast));
    // apply(place, view);

    context.controlOutput.output = ControlOutput.Return;

    return graph;
}
