import * as ESTree from 'estree';
import { AnimationGraph, createAnimationGraph } from '../../../animation/graph/AnimationGraph';
import { addVertex } from '../../../animation/graph/graph';
import { AnimationContext, ControlOutput, ControlOutputData } from '../../../animation/primitive/AnimationNode';
import { DataState } from '../../../environment/data/DataState';
import { resolvePath } from '../../../environment/environment';
import { AccessorType } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { Compiler, getNodeData } from '../../Compiler';

export function IfStatement(ast: ESTree.IfStatement, view: ViewState, context: AnimationContext) {
    const graph: AnimationGraph = createAnimationGraph(getNodeData(ast));

    // Points to the result of the test
    const testRegister = [{ type: AccessorType.Register, value: `${graph.id}_TestIf` }];

    const test = Compiler.compile(ast.test, view, { ...context, outputRegister: testRegister });
    addVertex(graph, test, { nodeData: getNodeData(ast.test) });

    // @TODO: Add a probe test animation
    const testData = resolvePath(getCurrentEnvironment(view), testRegister, null) as DataState;
    const testValue = testData.value as boolean;

    const controlOutput: ControlOutputData = { output: ControlOutput.None };

    if (testValue) {
        // Execute the body
        const body = Compiler.compile(ast.consequent, view, { ...context, controlOutput });
        addVertex(graph, body, { nodeData: getNodeData(ast.consequent) });
    } else if (ast.alternate != null) {
        // Execute the alternate (if any)
        const alternate = Compiler.compile(ast.alternate, view, { ...context, controlOutput });
        addVertex(graph, alternate, { nodeData: getNodeData(ast.alternate) });
    }

    context.controlOutput.output = controlOutput.output;

    return graph;
}
