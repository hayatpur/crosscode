import {
    AnimationTraceChain,
    AnimationTraceOperator,
    AnimationTraceOperatorType,
    getAllBranches,
    getTrace,
} from '../../execution/execution'
import { ExecutionGraph, instanceOfExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { instanceOfData } from '../View/Environment/data/DataState'
import { EnvironmentRenderer, getRelevantFlatData } from '../View/Environment/EnvironmentRenderer'
import { Trail } from './Trail'
import { TrailState, TrailType } from './TrailState'

/* ------------------------------------------------------ */
/*           A collection of parallel trails              */
/* ------------------------------------------------------ */
export class TrailGroup {
    trails: Trail[] = []
    execution: ExecutionGraph | ExecutionNode

    constructor(
        execution: ExecutionGraph | ExecutionNode,
        startEnvironment: EnvironmentRenderer,
        endEnvironment: EnvironmentRenderer
    ) {
        this.execution = execution

        if (instanceOfExecutionGraph(execution)) {
            const trailStates = getTrail(execution)
            for (const trailState of trailStates) {
                const trail = new Trail(trailState, startEnvironment, endEnvironment, execution)
                this.trails.push(trail)
            }
        } else {
            this.trails = []
        }
    }

    updateTime(time: number) {
        this.trails.forEach((trail) => {
            trail.controller.updateTime(time)
        })
    }

    destroy() {
        this.trails.forEach((trail) => {
            trail.destroy()
        })

        this.trails = null
        this.execution = null
    }
}

/* ------------------------------------------------------ */
/*                     Helper function                    */
/* ------------------------------------------------------ */

export function getTrail(execution: ExecutionGraph) {
    const traces = getTrace(execution)
    // traceChainsToString(traces, true)

    const preDataKeys = getRelevantFlatData(execution.precondition).map((data) =>
        instanceOfData(data) ? data.id : data.name
    )
    const postDataKeys = getRelevantFlatData(execution.postcondition).map((data) =>
        instanceOfData(data) ? data.id : data.name
    )
    const trails: TrailState[] = []

    for (const trace of traces) {
        const endOperations = []
        const endLeaves = []
        const branches = getAllBranches(trace)

        // Make sure that the item is in the postcondition
        if (!postDataKeys.includes(trace.value.id)) {
            continue
        }

        for (const branch of branches) {
            const [operations, leaves] = getAllOperationsAndLeaves(branch)
            const endOperation = operations[operations.length - 1]
            if (endOperation == null) {
                continue
            }

            const endLeaf = leaves[leaves.length - 1]
            if (endLeaf?.value?.id != null && !preDataKeys.includes(endLeaf.value.id)) {
                continue
            }

            endOperations.push(endOperation)
            endLeaves.push(endLeaf)
        }

        // Convert end operation and leaves to a trail
        const trailGroup: TrailState[] = convertEndOperationsAndLeavesToTrails(
            trace.value.id,
            endOperations,
            endLeaves
        )
        trails.push(...trailGroup)
    }

    return trails
}

export function convertEndOperationsAndLeavesToTrails(
    dataId: string,
    endOperations: AnimationTraceOperator[],
    leaves: AnimationTraceChain[]
): TrailState[] {
    // Effect types
    const effectTypes: AnimationTraceOperatorType[] = [
        AnimationTraceOperatorType.CopyLiteral,
        AnimationTraceOperatorType.MoveAndPlace,
    ]

    // Create types
    const createTypes: AnimationTraceOperatorType[] = [
        AnimationTraceOperatorType.CreateArray,
        AnimationTraceOperatorType.CreateLiteral,
        AnimationTraceOperatorType.CreateReference,
        AnimationTraceOperatorType.CreateVariable,
    ]

    let effects: TrailState[] = []
    let creates: TrailState[] = []

    // Partial move if multiple data affected it
    let partial = leaves.length > 1

    for (let i = 0; i < endOperations.length; i++) {
        const op = endOperations[i]
        const leaf = leaves[i]

        if (effectTypes.includes(op.type)) {
            effects.push({
                type: partial ? TrailType.PartialMove : TrailType.Move,
                fromDataIds: [leaf.value.id],
                toDataId: dataId,
            })
        }
    }

    if (partial) {
        effects.push({
            type: TrailType.PartialCreate,
            fromDataIds: leaves.map((leaf) => leaf.value?.id),
            toDataId: dataId,
        })
    }

    // if (effects.length > 1) {
    //     // TODO: If for the same data
    //     effects.forEach((effect) => {
    //         effect.type = TrailType.PartialMove
    //     })
    //     // TODO: Transition in the data
    // }

    if (effects.length == 0) {
        for (let i = 0; i < endOperations.length; i++) {
            const op = endOperations[i]
            const leaf = leaves[i]

            if (createTypes.includes(op.type) && creates.length === 0) {
                creates.push({
                    type: TrailType.Create,
                    toDataId: dataId,
                })
            }
        }
    }

    // console.log(dataId, endOperations, leaves)
    // console.log(effects, creates)
    // console.log('==============================')

    return [...effects, ...creates]
}

// export function getTrails(parent: ExecutionGraph): TrailState[] {
//     if (!parent.state.isShowingSteps) {
//         return null
//     }

//     const leaves = getLeavesOfView(parent)
//     let globalTraces: GlobalAnimationTraceChain[] = []

//     const cache: Set<string> = new Set<string>()

//     // Create trace from target to other leaves
//     for (let i = leaves.length - 1; i >= 1; i--) {
//         for (const trace of getGlobalTrace(parent, leaves, i)) {
//             const hash = sha1(trace)
//             if (cache.has(hash)) continue

//             globalTraces.push(trace)

//             cache.add(hash)
//         }
//     }

//     return globalTraces
// }

export function getAllOperationsAndLeaves(
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
