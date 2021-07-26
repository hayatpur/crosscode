import { AnimationNode } from '../../primitive/AnimationNode';
import { AnimationGraph } from '../AnimationGraph';

export class Edge {
    static id = 0;
    from: number;
    to: number;
    getData: any;
    options: {};
    type: string;
    id: number;

    constructor(from: number, to: number, getData = null, options = {}) {
        this.from = from;
        this.to = to;
        this.getData = getData;
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
