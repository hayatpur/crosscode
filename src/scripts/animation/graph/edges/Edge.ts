import { AnimationNode } from '../../primitive/AnimationNode';
import { AnimationData, AnimationGraph } from '../AnimationGraph';

export class Edge {
    static id = 0;
    from: number;
    to: number;
    data: AnimationData;
    options: {};
    type: string;
    id: number;

    constructor(from: number, to: number, data = null, options = {}) {
        this.from = from;
        this.to = to;
        this.data = data;
        this.options = options;
        this.type = this.constructor.name;
        this.id = Edge.id;
        Edge.id += 1;
    }

    getConstraint(vertices: (AnimationGraph | AnimationNode)[]) {
        console.error('getConstraint not implemented for', this);
        return 'getConstraint not implemented';
    }
}
