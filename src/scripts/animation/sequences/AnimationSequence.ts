import { Node } from '../../transpiler/Node'
import { AnimationGraph } from '../graph/AnimationGraph'

export default class AnimationSequence extends AnimationGraph {
    constructor(node: Node, options = {}) {
        super(node, { ...options, isSequence: true })
        this.edges = []
    }

    computeEdges() {
        this.edges = []
    }

    generateSequence() {
        return []
    }

    postGenerateSequence() {
        this.vertices.forEach((vertex) => (vertex.statement = this.node))
    }

    dissolve(options = {}) {}
}
