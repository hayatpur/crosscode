import * as ESTree from 'estree'
import { apply } from '../../animation/animation'
import {
    AnimationGraph,
    createAnimationGraph,
} from '../../animation/graph/AnimationGraph'
import { addVertex } from '../../animation/graph/graph'
import {
    AnimationContext,
    ControlOutput,
} from '../../animation/primitive/AnimationNode'
import { returnStatementAnimation } from '../../animation/primitive/Functions/ReturnStatementAnimation'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { Compiler, getNodeData } from '../Compiler'

export function ReturnStatement(
    ast: ESTree.ReturnStatement,
    view: PrototypicalEnvironmentState,
    context: AnimationContext
) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast))

    // Evaluate the result of argument into register
    const argument = Compiler.compile(ast.argument, view, {
        ...context,
        outputRegister: context.returnData.register,
    })
    addVertex(graph, argument, { nodeData: getNodeData(ast.argument) })

    // Make sure the memory this register is pointing at doesn't get destroyed
    // when popping scopes
    const ret = returnStatementAnimation(context.returnData)
    addVertex(graph, ret, { nodeData: getNodeData(ast) })
    apply(ret, view)

    // TODO: Does this need a move and place?
    // const place = moveAndPlaceAnimation(register, context.returnData.register);
    // addVertex(graph, place, getNodeData(ast));
    // apply(place, view);

    context.controlOutput.output = ControlOutput.Return

    return graph
}
