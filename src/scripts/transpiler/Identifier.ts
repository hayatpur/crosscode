import * as ESTree from 'estree';
import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationContext } from '../animation/primitive/AnimationNode';
import { CopyMoveSequence } from '../animation/sequences/CopyMoveSequence';
import { AccessorType } from '../environment/Data';
import { Node, NodeMeta } from './Node';

export class Identifier extends Node {
    name: string;
    constructor(ast: ESTree.Identifier, meta: NodeMeta) {
        super(ast, meta);
        this.name = ast.name;
    }

    getSpecifier() {
        return [{ type: AccessorType.Symbol, value: this.name }];
    }

    animation(context: AnimationContext): AnimationGraph {
        const graph = new AnimationGraph(this);

        const move = new CopyMoveSequence(this.getSpecifier(), context.outputSpecifier);
        graph.addVertex(move, this);

        return graph;
    }
}
