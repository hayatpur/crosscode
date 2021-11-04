import { EnvironmentState } from '../../../environment/EnvironmentState'
import { clone } from '../../../utilities/objects'
import { getCurrentEnvironment } from '../../../view/view'
import { ViewState } from '../../../view/ViewState'
import { AnimationNode, instanceOfAnimationNode } from '../../primitive/AnimationNode'
import { GroupStartAnimation } from '../../primitive/Group/GroupStartAnimation'
import { beginTransitionAnimation } from '../../primitive/Transition/BeginTransitionAnimation'
import { transitionCreateArray } from '../../primitive/Transition/Operations/CreateArrayTransitionAnimation'
import { transitionCreate } from '../../primitive/Transition/Operations/CreateTransitionAnimation'
import { transitionMove } from '../../primitive/Transition/Operations/MoveTransitionAnimation'
import {
    AnimationData,
    AnimationGraph,
    AnimationGraphVariant,
    createAbstraction,
    createAnimationGraph,
} from '../AnimationGraph'
import {
    addVertex,
    AnimationTraceChain,
    AnimationTraceOperator,
    getTrace,
    getUnionOfLocations,
    traceChainsToString,
} from '../graph'
import { AbstractionSpec } from './Abstractor'

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

export function applyTransition(animation: AnimationGraph | AnimationNode, config: AbstractionSpec) {
    if (instanceOfAnimationNode(animation)) {
        return
    }

    const trace = getTrace(animation)

    traceChainsToString(trace)

    // Concatenate the trace to start & end transition (if no trace => creation)
    const [transitionPrecondition, transitions] = getTransitionsFromTrace(animation, trace)

    // Create new level of abstraction
    const transitionAbstraction: AnimationGraphVariant = createAbstraction()
    transitionAbstraction.spec = config
    animation.abstractions.push(transitionAbstraction)
    animation.currentAbstractionIndex = animation.abstractions.length - 1

    // Locate the group start animation from default spec
    const groupStart = clone(animation.abstractions[0].vertices[0] as GroupStartAnimation)
    groupStart.leaveEmpty = true

    // Add the group start animation to the abstraction
    addVertex(animation, groupStart, { nodeData: groupStart.nodeData })

    // Begin transition graph
    const nodeData = {
        location: getUnionOfLocations(animation.abstractions[0].vertices.map((v) => v.nodeData.location)),
        type: 'Transition',
    }
    const graph: AnimationGraph = createAnimationGraph(nodeData)

    // Instantiates all entities
    const beginTransition = beginTransitionAnimation(transitionPrecondition)
    addVertex(graph, beginTransition, { nodeData })
    addVertex(animation, graph, { nodeData })

    // All transitions
    for (const transition of transitions) {
        addVertex(graph, transition, { nodeData: { ...nodeData, type: transition._name } })
    }

    // Make it parallel
    graph.abstractions[graph.currentAbstractionIndex].isParallel = true
    graph.abstractions[graph.currentAbstractionIndex].parallelStarts = [
        0,
        ...[...Array(transitions.length).keys()].map((_) => 10),
    ]
}

export interface TransitionAnimationNode extends AnimationNode {
    applyInvariant: (animation: TransitionAnimationNode, view: ViewState) => void
    output: AnimationData
    origins: AnimationData[]
}

function getTransitionsFromTrace(
    animation: AnimationGraph,
    trace: AnimationTraceChain[]
): [EnvironmentState, TransitionAnimationNode[]] {
    const view = clone(animation.postcondition)
    const environment = getCurrentEnvironment(view)
    const transitions: TransitionAnimationNode[] = []

    for (const chain of trace) {
        const [operations, leaves] = getAllOperationsAndLeaves(chain) // All operations and leaves (start output of data)

        if (operations.length == 0) {
            // No operations, meaning just preserve the data from previous
            operations.push(AnimationTraceOperator.MoveAndPlace)
            leaves.push({ value: chain.value })
        }

        // Based on the last operator, create a new animation node
        const transition = createTransitionAnimation(
            chain.value,
            operations,
            leaves.map((leaf) => leaf.value)
        )

        transition.applyInvariant(transition, view)

        transitions.push(transition)
    }

    return [environment, transitions]
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
