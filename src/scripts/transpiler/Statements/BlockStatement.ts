import * as ESTree from 'estree';
import { apply } from '../../animation/animation';
import { createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex } from '../../animation/graph/graph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { createScopeAnimation } from '../../animation/primitive/Scope/CreateScopeAnimation';
import { popScopeAnimation } from '../../animation/primitive/Scope/PopScopeAnimation';
import { ViewState } from '../../view/ViewState';
import { Compiler, getNodeData } from '../Compiler';

/**
 * A block contains a sequence of one or more statements.
 */
export function BlockStatement(ast: ESTree.BlockStatement, view: ViewState, context: AnimationContext) {
    const graph = createAnimationGraph(getNodeData(ast));

    context.locationHint = [];

    // Create a scope
    const createScope = createScopeAnimation();
    addVertex(graph, createScope, getNodeData(ast));
    apply(createScope, view);

    // Add statements
    for (const statement of ast.body) {
        const animation = Compiler.compile(statement, view, context);
        addVertex(graph, animation, getNodeData(statement));
    }

    // Pop scope
    const popScope = popScopeAnimation();
    addVertex(graph, popScope, getNodeData(ast));
    apply(popScope, view);

    return graph;
}
