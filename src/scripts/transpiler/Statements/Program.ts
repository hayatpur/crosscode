import * as ESTree from 'estree';
import { createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex } from '../../animation/graph/graph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { ViewState } from '../../view/ViewState';
import { Compiler, getNodeData } from '../Compiler';

export function Program(ast: ESTree.Program, view: ViewState, context: AnimationContext) {
    const graph = createAnimationGraph(getNodeData(ast));

    // Add blocks
    for (const statement of ast.body) {
        const animation = Compiler.compile(statement, view, context);
        addVertex(graph, animation, getNodeData(statement));
    }

    return graph;
}
