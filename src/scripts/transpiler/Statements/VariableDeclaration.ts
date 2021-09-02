import * as ESTree from 'estree';
import { AnimationGraph, createAnimationGraph } from '../../animation/graph/AnimationGraph';
import { addVertex } from '../../animation/graph/graph';
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
        const graph: AnimationGraph = createAnimationGraph(this);

        for (let i = 0; i < this.declarations.length; i++) {
            addVertex(graph, this.declarations[i].animation(context), this.declarations[i]);
        }

        return graph;
    }
}
