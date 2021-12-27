import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { clone } from '../../../utilities/objects'
import {
    AnimationNode,
    instanceOfAnimationNode,
} from '../../primitive/AnimationNode'
import { initializeTransitionAnimation } from '../../primitive/Transition/InitializeTransitionAnimation'
import { transitionCreateArray } from '../../primitive/Transition/Operations/CreateArrayTransitionAnimation'
import { transitionCreate } from '../../primitive/Transition/Operations/CreateTransitionAnimation'
import { transitionMove } from '../../primitive/Transition/Operations/MoveTransitionAnimation'
import {
    AnimationData,
    AnimationGraph,
    createAnimationGraph,
} from '../AnimationGraph'
import {
    addVertex,
    AnimationTraceChain,
    AnimationTraceOperator,
    getChunkTrace,
} from '../graph'

export interface TransitionAnimationNode extends AnimationNode {
    applyInvariant: (
        animation: TransitionAnimationNode,
        view: PrototypicalEnvironmentState
    ) => void
    output: AnimationData
    origins: AnimationData[]
}

/**
 * Creates an animation from a graph
 * @param node
 * @returns
 */
export function createTransition(node: AnimationNode | AnimationGraph) {
    if (instanceOfAnimationNode(node)) {
        return clone(node)
    }

    const nodeData = { ...clone(node.nodeData), type: 'Transition' }
    const transition = createAnimationGraph(nodeData)

    const trace = getChunkTrace(node)
    const transitions = getTransitionsFromTrace(trace)

    // Chunk
    const nodes = node.abstractions[0].vertices

    // Initialize to the post condition
    const init = initializeTransitionAnimation(
        clone(nodes[nodes.length - 1].postcondition)
    )

    addVertex(transition, init, {
        nodeData: { ...nodeData, type: 'Transition Animation' },
    })

    // Add all the transitions
    for (const t of transitions) {
        addVertex(transition, t, { nodeData: t.nodeData })
    }

    transition.precondition = node.precondition
    transition.postcondition = node.postcondition

    return transition
}

function getTransitionsFromTrace(
    trace: AnimationTraceChain[]
): TransitionAnimationNode[] {
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

function getAllOperationsAndLeaves(
    chain: AnimationTraceChain
): [AnimationTraceOperator[], AnimationTraceChain[]] {
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
    console.assert(
        lastOperator in mapping,
        'Last operator not in mapping',
        operations
    )

    // Create the transition animation
    const transition: TransitionAnimationNode = mapping[lastOperator](
        output,
        origins
    )

    return transition
}
