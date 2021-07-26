import { AnimationNode } from '../../primitive/AnimationNode';
import { AnimationGraph } from '../AnimationGraph';
import { Edge } from './Edge';

export default class FlowEdge extends Edge {
    constructor(from: number, to: number, getData: any) {
        super(from, to, getData);
    }

    getConstraint(vertices: (AnimationGraph | AnimationNode)[]) {
        return `V${this.to} - V${this.from} >= ${vertices[this.from].duration + vertices[this.to].delay}`;
    }
}
