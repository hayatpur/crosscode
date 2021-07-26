import * as ESTree from 'estree';
import { AnimationGraph } from '../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { Node, NodeMeta } from '../Node';

/**
 * A block contains a sequence of one or more statements.
 */
export class BlockStatement extends Node {
    statements: Node[];

    constructor(ast: ESTree.BlockStatement, meta: NodeMeta) {
        super(ast, meta);
        this.statements = [];
    }

    add(node: Node, path: number[]) {
        // Base-case, there are no more paths to find
        if (path.length == 0) {
            this.statements.push(node);
            return;
        }

        // Slot in to the right path
        for (let i = this.statements.length - 1; i >= 0; i--) {
            const statement = this.statements[i];

            if (statement.meta.line == path[0]) {
                statement.add(node, path.slice(1));
                break;
            }
        }
    }

    animation(context: AnimationContext): AnimationGraph {
        const animation = new AnimationGraph(this);

        for (const statement of this.statements) {
            animation.addVertex(statement.animation(context), statement);
        }

        return animation;
    }
}
