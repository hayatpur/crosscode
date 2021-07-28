import * as ESTree from 'estree';
import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationContext } from '../animation/primitive/AnimationNode';
import { CreateLiteralAnimation } from '../animation/primitive/CreateLiteralAnimation';
import { Node, NodeMeta } from './Node';

export class Literal extends Node {
    value: string | number | bigint | boolean | RegExp;

    constructor(ast: ESTree.Literal, meta: NodeMeta) {
        super(ast, meta);
        this.value = ast.value;
    }

    animation(context: AnimationContext): AnimationGraph {
        const graph = new AnimationGraph(this);
        graph.addVertex(
            new CreateLiteralAnimation(this.value, context.outputSpecifier, {
                speedMultiplier: context?.speedMultiplier,
            }),
            this
        );
        return graph;
    }
}
