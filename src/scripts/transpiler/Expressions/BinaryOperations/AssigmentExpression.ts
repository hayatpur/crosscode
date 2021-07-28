import * as ESTree from 'estree';
import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import { Identifier } from '../../Identifier';
import { Node, NodeMeta } from '../../Node';
import { Transpiler } from '../../Transpiler';
import { MemberExpression } from './MemberExpression';

export class AssignmentExpression extends Node {
    left: Node;
    right: Node;

    constructor(ast: ESTree.AssignmentExpression, meta: NodeMeta) {
        super(ast, meta);

        this.left = Transpiler.transpile(ast.left, meta);
        this.right = Transpiler.transpile(ast.right, meta);
    }

    animation(context: AnimationContext) {
        const graph = new AnimationGraph(this, { shouldDissolve: true });

        const outputSpecifier =
            this.left instanceof MemberExpression ? this.left.getSpecifier() : (this.left as Identifier).getSpecifier();

        const right = this.right.animation({
            ...context,
            outputSpecifier,
        });

        graph.addVertex(right, this);

        return graph;
    }
}
