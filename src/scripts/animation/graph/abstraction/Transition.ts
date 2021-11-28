import { clone } from '../../../utilities/objects'
import { RootViewState } from '../../../view/ViewState'
import { currentAbstraction } from '../../animation'
import { AnimationNode } from '../../primitive/AnimationNode'
import { initializeTransitionAnimation } from '../../primitive/Transition/InitializeTransitionAnimation'
import { transitionCreateArray } from '../../primitive/Transition/Operations/CreateArrayTransitionAnimation'
import { transitionCreate } from '../../primitive/Transition/Operations/CreateTransitionAnimation'
import { transitionMove } from '../../primitive/Transition/Operations/MoveTransitionAnimation'
import { AnimationData, AnimationGraph, createAbstraction, createAnimationGraph } from '../AnimationGraph'
import {
    addVertex,
    addVertexAt,
    AnimationTraceChain,
    AnimationTraceOperator,
    getChunkTrace,
    getUnionOfLocations,
    removeVertexAt,
    traceChainsToString,
} from '../graph'
import { AbstractOptions, AnimationChunk } from './Abstractor'

// export interface Trace {
//     operation: TraceOperation;
//     value: any;
//     location: any;
// }

// export enum TraceOperation {
//     Move = 'Move',
//     Combine = 'Add',
//     NoChangeMove = 'NoChangeMove',
// }

export function applyTransition(chunk: AnimationChunk, config: AbstractOptions) {
    if (chunk.nodes.length == 0) {
        return
    }

    const trace = getChunkTrace(chunk)
    traceChainsToString(trace)

    // Get the animations
    const transitions = getTransitionsFromTrace(trace)

    // Create new level of abstraction in the parent that's the same as existing one
    const transitionAbstraction = createAbstraction()
    transitionAbstraction.spec = config
    chunk.parent.abstractions.push(clone(currentAbstraction(chunk.parent)))
    chunk.parent.currentAbstractionIndex = chunk.parent.abstractions.length - 1

    // Begin transition graph
    const nodeData = {
        location: getUnionOfLocations(chunk.nodes.map((v) => v.nodeData.location)),
        type: 'Chunk',
    }
    const graph: AnimationGraph = createAnimationGraph(nodeData)

    // Instantiates all entities
    const initializeTransition = initializeTransitionAnimation(
        clone(chunk.nodes[chunk.nodes.length - 1].postcondition.environment)
    )
    addVertex(graph, initializeTransition, { nodeData })

    // All transitions
    for (const transition of transitions) {
        addVertex(graph, transition, { nodeData: { ...nodeData, type: transition._name } })
    }

    // Make it parallel
    graph.abstractions[graph.currentAbstractionIndex].isParallel = true
    graph.abstractions[graph.currentAbstractionIndex].parallelStarts = [
        0,
        ...[...Array(transitions.length).keys()].map((_) => 25),
    ]

    // Remove all nodes in chunk from parent
    const vertices = currentAbstraction(chunk.parent).vertices
    const location = vertices.findIndex((node) => node.id == chunk.nodes[0].id)
    for (let i = vertices.length - 1; i >= 0; i--) {
        if (i >= location && i < location + chunk.nodes.length) {
            removeVertexAt(chunk.parent, i)
        }
    }

    // Add transition graph to parent
    addVertexAt(chunk.parent, location, graph, { nodeData })
}

export interface TransitionAnimationNode extends AnimationNode {
    applyInvariant: (animation: TransitionAnimationNode, view: RootViewState) => void
    output: AnimationData
    origins: AnimationData[]
}

function getTransitionsFromTrace(trace: AnimationTraceChain[]): TransitionAnimationNode[] {
    const transitions: TransitionAnimationNode[] = []

    for (const chain of trace) {
        const [operations, leaves] = getAllOperationsAndLeaves(chain) // All operations and leaves (start output of data)

        if (operations.length == 0) {
            // No operations, meaning just preserve the data from previous
            // operations.push(AnimationTraceOperator.MoveAndPlace)
            // leaves.push({ value: chain.value })
            continue
        }

        // Create a new animations from the chain
        const transition = createTransitionAnimation(
            chain.value,
            operations,
            leaves.map((leaf) => leaf.value)
        )

        transitions.push(transition)
    }

    return transitions
}

function createTransitionAnimation(
    output: AnimationData,
    operations: AnimationTraceOperator[],
    origins: AnimationData[]
): TransitionAnimationNode {
    const mapping = {
        [AnimationTraceOperator.MoveAndPlace]: transitionMove,
        [AnimationTraceOperator.CopyLiteral]: transitionMove,
        [AnimationTraceOperator.CreateLiteral]: transitionCreate,
        [AnimationTraceOperator.CreateArray]: transitionCreateArray,
    }

    // Transition animation is dominated by the last (lease recent) operator
    const lastOperator = operations[operations.length - 1]
    console.assert(lastOperator in mapping, 'Last operator not in mapping', operations)

    // Create the transition animation
    const transition: TransitionAnimationNode = mapping[lastOperator](output, origins)

    return transition
}

function getAllOperationsAndLeaves(chain: AnimationTraceChain): [AnimationTraceOperator[], AnimationTraceChain[]] {
    if (chain.children == null) return [[], []]

    const operations: AnimationTraceOperator[] = []
    const leaves: AnimationTraceChain[] = []

    // TODO: Unique branches
    for (const child of chain.children) {
        const operator = child[0]
        const value = child[1]

        operations.push(operator)

        if (value.children == null) {
            leaves.push(value)
        }

        const [childOperations, childLeaves] = getAllOperationsAndLeaves(value)
        operations.push(...childOperations)
        leaves.push(...childLeaves)
    }

    return [operations, leaves]
}
