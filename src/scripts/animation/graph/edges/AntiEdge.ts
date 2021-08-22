import { AnimationNode } from '../../primitive/AnimationNode';
import { AnimationGraph } from '../AnimationGraph';
import { Edge } from './Edge';

export default class AntiEdge extends Edge {
    constructor(from: number, to: number, data: any) {
        super(from, to, data);
    }

    getConstraint(vertices: (AnimationGraph | AnimationNode)[]) {
        return `V${this.from} - V${this.to} <= ${vertices[this.to].duration - vertices[this.from].delay}`;
    }
}
