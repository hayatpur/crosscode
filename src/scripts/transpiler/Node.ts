import * as ESTree from 'estree';
import { AnimationGraph } from '../animation/graph/AnimationGraph';
import { AnimationContext } from '../animation/primitive/AnimationNode';
import { Data } from '../environment/Data';

export interface NodeMeta {
    index: number;
    states: { prev: { [s: string]: any }; current: { [s: string]: any }; next: { [s: string]: any } };
    line: number;
    path: number[];
}

export class Node {
    meta: NodeMeta;

    constructor(ast: ESTree.Node, meta: NodeMeta) {
        this.meta = meta;
    }

    animation(context?: AnimationContext): AnimationGraph {
        console.error('[Node] Animation method not implemented for', this);
        return new AnimationGraph(null);
    }

    // Data methods
    getData(options?: any): Data {
        console.error('[Node] Get data method not implemented for', this);
        return new Data({
            type: null,
            value: null,
        });
    }

    reads(options = {}): Set<() => Data> {
        return new Set();
    }

    writes(options = {}): Set<() => Data> {
        return new Set();
    }

    add(node: Node, path: number[]) {
        console.error('[Node] Add method not implemented for', this);
    }
}
