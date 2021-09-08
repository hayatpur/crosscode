import * as ESTree from 'estree';
import { apply } from '../../../../animation/animation';
import { createAnimationGraph } from '../../../../animation/graph/AnimationGraph';
import { addVertex } from '../../../../animation/graph/graph';
import { AnimationContext } from '../../../../animation/primitive/AnimationNode';
import { binaryExpressionEvaluate } from '../../../../animation/primitive/Binary/BinaryExpressionEvaluate';
import { AccessorType } from '../../../../environment/EnvironmentState';
import { ViewState } from '../../../../view/ViewState';
import { Compiler, getNodeData } from '../../../Compiler';

export function BinaryExpression(ast: ESTree.BinaryExpression, view: ViewState, context: AnimationContext) {
    const graph = createAnimationGraph(getNodeData(ast));

    const leftRegister = [{ type: AccessorType.Register, value: `${graph.id}_BinaryExpressionLeft` }];
    const rightRegister = [{ type: AccessorType.Register, value: `${graph.id}_BinaryExpressionRight` }];

    const left = Compiler.compile(ast.left, view, { ...context, outputRegister: leftRegister });
    addVertex(graph, left, getNodeData(ast.left));

    const right = Compiler.compile(ast.right, view, { ...context, outputRegister: rightRegister });
    addVertex(graph, right, getNodeData(ast.right));

    const evaluate = binaryExpressionEvaluate(leftRegister, rightRegister, ast.operator, context.outputRegister);
    addVertex(graph, evaluate, this);
    apply(evaluate, view);

    return graph;
}
