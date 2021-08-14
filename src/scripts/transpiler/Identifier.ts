import * as ESTree from 'estree';
import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationContext } from '../animation/primitive/AnimationNode';
import CopyDataAnimation from '../animation/primitive/Data/CopyDataAnimation';
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

        // Create a copy of it
        const copy = new CopyDataAnimation(this.getSpecifier());
        graph.addVertex(copy, this);

        // Float it up
        // const float = new FloatAnimation(this.getSpecifier())
        // graph.addVertex(float, this)

        return graph;
    }
}
