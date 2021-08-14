import * as ESTree from 'estree';
import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationContext } from '../animation/primitive/AnimationNode';

export interface NodeMeta {
    index: number;
    states: { prev: { [s: string]: any }; current: { [s: string]: any }; next: { [s: string]: any } };
    line: number;
    path: number[];
}

export class Node {
    meta: NodeMeta;
    loc: ESTree.SourceLocation;

    constructor(ast: ESTree.Node, meta: NodeMeta) {
        this.meta = meta;
        this.loc = ast.loc;
    }

    animation(context?: AnimationContext): AnimationGraph {
        console.error('[Node] Animation method not implemented for', this);
        return new AnimationGraph(null);
    }

    add(node: Node, path: number[]) {
        console.error('[Node] Add method not implemented for', this);
    }
}
