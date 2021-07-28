import * as ESTree from 'estree';
import { AnimationGraph } from '../../../../animation/graph/AnimationGraph';
import { Node, NodeMeta } from '../../../Node';
import { Transpiler } from '../../../Transpiler';

export default class BinaryExpression extends Node {
    left: Node;
    right: Node;
    operator: string;

    constructor(ast: ESTree.BinaryExpression, meta: NodeMeta) {
        super(ast, meta);

        this.left = Transpiler.transpile(ast.left, meta);
        this.right = Transpiler.transpile(ast.right, meta);

        this.operator = ast.operator;

        // @ts-ignore
    }

    animation(context = {}) {
        const graph = new AnimationGraph(this, { shouldDissolve: true });

        // const animation = new BinaryExpressionSequence(
        //     this.left.getData.bind(this.left),
        //     this.right.getData.bind(this.right),
        //     context.getOutputData,
        //     this.getData.bind(this),
        //     context.getSectionData,
        //     this.operator
        // );

        // graph.addVertex(animation, context.statement);

        return graph;
    }
}
