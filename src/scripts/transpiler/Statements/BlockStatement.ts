import * as ESTree from 'estree';
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex, removeVertexAt } from '../../animation/graph/graph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { createScopeAnimation } from '../../animation/primitive/Scope/CreateScopeAnimation';
import { popScopeAnimation } from '../../animation/primitive/Scope/PopScopeAnimation';
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

    animation(context: AnimationContext, isProgram = false): AnimationGraph {
        const graph = createAnimationGraph(this);
        if (!isProgram) addVertex(graph, createScopeAnimation(), this);

        context.outputRegister = [];

        let group = createAnimationGraph(this);
        let line = this.statements[0]?.meta.line;

        for (const statement of this.statements) {
            if (statement.meta.line > line + 1) {
                if (group.vertices.length == 1) {
                    addVertex(graph, group.vertices[0], this);
                    removeVertexAt(group, 0);
                } else if (group.vertices.length > 1) {
                    addVertex(graph, group, this);
                    group = createAnimationGraph(this);
                }
            }

            addVertex(group, statement.animation(context), statement);
            line = statement.meta.line;
            // addVertex(animation, statement.animation(context), statement);
        }

        if (group.vertices.length == 1) {
            addVertex(graph, group.vertices[0], this);
            removeVertexAt(group, 0);
        } else {
            addVertex(graph, group, this);
        }

        if (!isProgram) addVertex(group, popScopeAnimation(), this);

        return group;
    }
}
