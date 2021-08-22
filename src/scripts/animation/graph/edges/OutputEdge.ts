import { AnimationNode } from '../../primitive/AnimationNode';
import { AnimationGraph } from '../AnimationGraph';
import { Edge } from './Edge';

export default class OutputEdge extends Edge {
    constructor(from: number, to: number, data: any) {
        super(from, to, data);
    }

    getConstraint(vertices: (AnimationGraph | AnimationNode)[]) {
        return `V${this.to} - V${this.from} >= ${vertices[this.from].duration + vertices[this.to].delay}`;
    }
}
