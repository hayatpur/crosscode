import * as ESTree from 'estree';
import { AnimationGraph } from '../../../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../../../animation/primitive/AnimationNode';
import BinaryExpressionEvaluate from '../../../../animation/primitive/Binary/BinaryExpressionEvaluate';
import BinaryExpressionSetup from '../../../../animation/primitive/Binary/BinaryExpressionSetup';
import { AccessorType } from '../../../../environment/Data';
import { Node, NodeMeta } from '../../../Node';
import { Transpiler } from '../../../Transpiler';

export default class BinaryExpression extends Node {
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
        const graph = new AnimationGraph(this);

        const leftRegister = [{ type: AccessorType.Register, value: `${this.id}__BinaryExpressionLeft` }];
        const rightRegister = [{ type: AccessorType.Register, value: `${this.id}__BinaryExpressionRight` }];

        const left = this.left.animation({ ...context, outputRegister: leftRegister });
        graph.addVertex(left, this.left);

        const right = this.right.animation({ ...context, outputRegister: rightRegister });
        graph.addVertex(right, this.right);

        const initial = new BinaryExpressionSetup(leftRegister, rightRegister, this.operator);
        graph.addVertex(initial, this);

        const evaluate = new BinaryExpressionEvaluate(
            leftRegister,
            rightRegister,
            context.outputRegister,
            this.operator
        );
        graph.addVertex(evaluate, this);

        return graph;
    }
}
