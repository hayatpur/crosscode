import * as ESTree from 'estree';
import { apply } from '../../../animation/animation';
import { AnimationGraph, createAnimationGraph } from '../../../animation/graph/AnimationGraph';
import { addVertex } from '../../../animation/graph/graph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import { createScopeAnimation } from '../../../animation/primitive/Scope/CreateScopeAnimation';
import { popScopeAnimation } from '../../../animation/primitive/Scope/PopScopeAnimation';
import { DataState } from '../../../environment/data/DataState';
import { resolvePath } from '../../../environment/environment';
import { AccessorType } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { Compiler, getNodeData } from '../../Compiler';

export function ForStatement(ast: ESTree.ForStatement, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    // Create a scope
    const createScope = createScopeAnimation();
    addVertex(graph, createScope, getNodeData(ast));
    apply(createScope, view);

    // Init
    const init = Compiler.compile(ast.init, view, context);
    addVertex(graph, init, getNodeData(ast.init));

    // Points to the result of test

    let _i = 0;
    // Loop
    while (true) {
        // Test
        const testRegister = [{ type: AccessorType.Register, value: `${graph.id}_TestIf${_i}` }];
        const test = Compiler.compile(ast.test, view, { ...context, outputRegister: testRegister });
        addVertex(graph, test, getNodeData(ast.test));
        const testData = resolvePath(getCurrentEnvironment(view), testRegister, null) as DataState; // @TODO: Add a probe test animation
        const testValue = testData.value as boolean;
        if (!testValue) break;

        // Body
        const body = Compiler.compile(ast.body, view, context);
        addVertex(graph, body, getNodeData(ast.body));

        // Update
        const update = Compiler.compile(ast.update, view, context);
        addVertex(graph, update, getNodeData(ast.update));

        _i++;
    }

    // Pop scope
    const popScope = popScopeAnimation();
    addVertex(graph, popScope, getNodeData(ast));
    apply(popScope, view);

    return graph;
}
