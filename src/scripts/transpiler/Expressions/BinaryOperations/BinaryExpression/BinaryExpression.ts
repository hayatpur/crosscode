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

        // @ts-ignore
    }

    animation(context: AnimationContext): AnimationGraph {
        const graph = new AnimationGraph(this, { shouldDissolve: true });

        const left = this.left.animation(context);
        graph.addVertex(left, this.left);

        const right = this.right.animation(context);
        graph.addVertex(right, this.right);

        const initial = new BinaryExpressionSetup(
            [
                { type: AccessorType.Symbol, value: '_FloatingStack' },
                { type: AccessorType.Index, value: -2 },
            ],
            [
                { type: AccessorType.Symbol, value: '_FloatingStack' },
                { type: AccessorType.Index, value: -1 },
            ],
            this.operator
        );
        graph.addVertex(initial, this);

        const evaluate = new BinaryExpressionEvaluate(
            [
                { type: AccessorType.Symbol, value: '_FloatingStack' },
                { type: AccessorType.Index, value: -2 },
            ],
            [
                { type: AccessorType.Symbol, value: '_FloatingStack' },
                { type: AccessorType.Index, value: -1 },
            ],
            this.operator
        );
        graph.addVertex(evaluate, this);

        return graph;
    }
}
