import * as ESTree from 'estree';
import { AnimationGraph, createAnimationGraph } from '../animation/graph/AnimationGraph';
import { addVertex } from '../animation/graph/graph';
import { AnimationContext } from '../animation/primitive/AnimationNode';
import { copyDataAnimation } from '../animation/primitive/Data/CopyDataAnimation';
import { AccessorType } from '../environment/EnvironmentState';
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
        const graph = createAnimationGraph(this);

        // Create a copy of it
        const copy = copyDataAnimation(this.getSpecifier(), context.outputRegister);
        addVertex(graph, copy, this);

        // Float it up
        // const float = new FloatAnimation(this.getSpecifier())
        // addVertex(graph, float, this)

        return graph;
    }
}
