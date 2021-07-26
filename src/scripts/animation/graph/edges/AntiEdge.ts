import { AnimationNode } from '../../primitive/AnimationNode';
import { AnimationGraph } from '../AnimationGraph';
import { Edge } from './Edge';

export default class AntiEdge extends Edge {
    constructor(from: number, to: number, getData: any) {
        super(from, to, getData);
    }

    getConstraint(vertices: (AnimationGraph | AnimationNode)[]) {
        return `V${this.to} - V${this.from} >= 0`;
    }
}
