import * as ESTree from 'estree';
import { AnimationGraph, AnimationGroup } from '../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import CreateScopeAnimation from '../../animation/primitive/Scope/CreateScopeAnimation';
import PopScopeAnimation from '../../animation/primitive/Scope/PopScopeAnimation';
import { FloatingExpressionStatement } from '../Expressions/FloatingExpressionStatement';
import { FunctionStatement } from '../Functions/FunctionStatement';
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
        if (node instanceof FunctionStatement) {
            const floating = FloatingExpressionStatement.statements;
            const latest = floating[floating.length - 1];

            if (latest != null && latest.body == null) {
                latest.body = node;
            }

            // return
        }

        if (node instanceof FloatingExpressionStatement) return;

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

    animation(context: AnimationContext, isProgram = false): AnimationGraph {
        const animation = new AnimationGraph(this);
        if (!isProgram) animation.addVertex(new CreateScopeAnimation(), this);

        context.outputRegister = [];

        let group = new AnimationGroup(this);
        let line = this.statements[0]?.meta.line;

        for (const statement of this.statements) {
            if (statement.meta.line > line + 1) {
                if (group.vertices.length == 1) {
                    animation.addVertex(group.vertices[0], this);
                    group.removeVertexAt(0);
                } else if (group.vertices.length > 1) {
                    animation.addVertex(group, this);
                    group = new AnimationGroup(this);
                }
            }

            group.addVertex(statement.animation(context), statement);
            line = statement.meta.line;
            // animation.addVertex(statement.animation(context), statement);
        }

        animation.addVertex(group, this);
        if (!isProgram) animation.addVertex(new PopScopeAnimation(), this);

        return animation;
    }
}
