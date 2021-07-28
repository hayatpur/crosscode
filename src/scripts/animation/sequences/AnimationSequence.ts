import { AnimationGraph } from '../graph/AnimationGraph';

export default class AnimationSequence extends AnimationGraph {
    constructor(options = {}) {
        super(null, { ...options, isSequence: true });
        this.edges = [];
    }

    computeEdges() {
        this.edges = [];
    }

    generateSequence() {
        return [];
    }

    dissolve(options = {}) {}
}
