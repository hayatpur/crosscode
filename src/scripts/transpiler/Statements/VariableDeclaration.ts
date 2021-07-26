import * as ESTree from 'estree';
import { AnimationGraph } from '../../animation/graph/AnimationGraph';
import { AnimationContext } from '../../animation/primitive/AnimationNode';
import { Node, NodeMeta } from '../Node';
import { VariableDeclarator } from './VariableDeclarator';

export class VariableDeclaration extends Node {
    declarations: VariableDeclarator[];

    constructor(ast: ESTree.VariableDeclaration, meta: NodeMeta) {
        super(ast, meta);
        this.declarations = ast.declarations.map((el) => new VariableDeclarator(el, meta));
    }

    animation(context: AnimationContext) {
        const graph: AnimationGraph = new AnimationGraph(this, { shouldDissolve: true });

        for (let i = 0; i < this.declarations.length; i++) {
            graph.addVertex(this.declarations[i].animation(context), this.declarations[i]);
        }

        return graph;
    }
}
