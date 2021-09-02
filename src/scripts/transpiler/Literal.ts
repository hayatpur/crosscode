import * as ESTree from 'estree';
import { AnimationGraph, createAnimationGraph } from '../animation/graph/AnimationGraph';
import { addVertex } from '../animation/graph/graph';
import { AnimationContext } from '../animation/primitive/AnimationNode';
import { createLiteralAnimation } from '../animation/primitive/Data/CreateLiteralAnimation';
import { Node, NodeMeta } from './Node';

export type literal = string | number | bigint | boolean | RegExp;

export class Literal extends Node {
    value: string | number | bigint | boolean | RegExp;

    constructor(ast: ESTree.Literal, meta: NodeMeta) {
        super(ast, meta);
        this.value = ast.value;
    }

    animation(context: AnimationContext): AnimationGraph {
        const graph = createAnimationGraph(this);
        const create = createLiteralAnimation(this.value, context.outputRegister, context.locationHint);
        addVertex(graph, create, this);
        return graph;
    }
}
