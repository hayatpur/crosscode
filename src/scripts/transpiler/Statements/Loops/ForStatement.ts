import * as ESTree from 'estree';
import { AnimationGraph } from '../../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../../animation/primitive/AnimationNode';
import CreateScopeAnimation from '../../../animation/primitive/Scope/CreateScopeAnimation';
import PopScopeAnimation from '../../../animation/primitive/Scope/PopScopeAnimation';
import { Node, NodeMeta } from '../../Node';
import { Transpiler } from '../../Transpiler';
import ForStatementIteration from './ForStatementIteration';

export default class ForStatement extends Node {
    iterations: ForStatementIteration[];
    decl: any;

    // TODO: support non-variable declarations
    constructor(ast: ESTree.ForStatement, meta: NodeMeta) {
        super(ast, meta);

        // Iterations of this for loop
        this.iterations = [];
        this.decl = Transpiler.transpile(ast.init, meta);
    }

    add(node: Node, path: number[]) {
        if (node instanceof ForStatementIteration && path.length == 0) {
            this.iterations.push(node);
        } else {
            this.iterations[this.iterations.length - 1].add(node, path.slice(1));
        }
    }

    animation(context: AnimationContext) {
        const graph = new AnimationGraph(this);

        graph.addVertex(new CreateScopeAnimation(), this);

        const decl = this.decl.animation(context);
        graph.addVertex(decl, this.decl);

        for (let i = 0; i < this.iterations.length; i++) {
            graph.addVertex(this.iterations[i].animation(context), this.iterations[i]);

            if (this.iterations[i].incr != null) {
                const incr = this.iterations[i].incr.animation(context);
                graph.addVertex(incr, this.iterations[i].incr);
            }
        }

        graph.addVertex(new PopScopeAnimation(), this);

        return graph;
    }
}
