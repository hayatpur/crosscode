import * as ESTree from 'estree';
import { AnimationGraph, createAnimationGraph } from '../../../../animation/graph/AnimationGraph';
import { addVertex } from '../../../../animation/graph/graph';
import { AnimationContext } from '../../../../animation/primitive/AnimationNode';
import { binaryExpressionEvaluate } from '../../../../animation/primitive/Binary/BinaryExpressionEvaluate';
import { binaryExpressionSetup } from '../../../../animation/primitive/Binary/BinaryExpressionSetup';
import { AccessorType } from '../../../../environment/EnvironmentState';
import { Node, NodeMeta } from '../../../Node';
import { Transpiler } from '../../../Transpiler';

export class BinaryExpression extends Node {
    left: Node;
    right: Node;
    operator: ESTree.BinaryOperator;

    constructor(ast: ESTree.BinaryExpression, meta: NodeMeta) {
        super(ast, meta);

        this.left = Transpiler.transpile(ast.left, meta);
        this.right = Transpiler.transpile(ast.right, meta);

        this.operator = ast.operator;
    }

    animation(context: AnimationContext): AnimationGraph {
        const graph = createAnimationGraph(this);

        const leftRegister = [{ type: AccessorType.Register, value: `${this.id}_BinaryExpressionLeft` }];
        const rightRegister = [{ type: AccessorType.Register, value: `${this.id}_BinaryExpressionRight` }];

        const left = this.left.animation({ ...context, outputRegister: leftRegister });
        addVertex(graph, left, this.left);

        const right = this.right.animation({ ...context, outputRegister: rightRegister });
        addVertex(graph, right, this.right);

        const initial = binaryExpressionSetup(leftRegister, rightRegister, this.operator);
        addVertex(graph, initial, this);

        const evaluate = binaryExpressionEvaluate(leftRegister, rightRegister, this.operator, context.outputRegister);
        addVertex(graph, evaluate, this);

        return graph;
    }
}
