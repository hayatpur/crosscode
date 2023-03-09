import { clone } from '../../../utilities/objects'
import {
    AnimationTraceChain,
    AnimationTraceOperator,
    AnimationTraceOperatorType,
    getAllBranches,
    getTrace,
} from '../../execution/execution'
import { ExecutionGraph, instanceOfExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { EnvironmentState, Residual } from '../../transpiler/EnvironmentState'
import { instanceOfData } from '../View/Environment/data/DataState'
import { EnvironmentRenderer, getRelevantFlatData } from '../View/Environment/EnvironmentRenderer'
import { Trail } from './Trail'
import { TrailState, TrailType } from './TrailState'

/* ------------------------------------------------------ */
/*           A collection of parallel trails              */
/* ------------------------------------------------------ */
export class TrailGroup {
    trails: Trail[] | null = []
    execution: ExecutionGraph | ExecutionNode | null

    constructor(execution: ExecutionGraph | ExecutionNode, time: number) {
        this.execution = execution

        if (instanceOfExecutionGraph(execution)) {
            const trailStates = getTrail(execution)
            for (const trailState of trailStates) {
                const trail = new Trail(trailState, execution, time)
                this.trails!.push(trail)
            }
        } else {
            this.trails = []
        }
    }

    updateTime(amount: number, environment: EnvironmentRenderer, totalTime: number) {
        this.trails!.forEach((trail) => {
            trail.update(amount, environment, totalTime)
        })
    }

    postUpdate(amount: number, environment: EnvironmentRenderer, totalTime: number) {
        this.trails!.forEach((trail) => {
            trail.renderer.postUpdate(amount, environment, totalTime)
        })
    }

    computeResidual(environment: EnvironmentState): Residual[] {
        const residual: Residual[] = []
        this.trails!.forEach((trail) => {
            const trailResidual = trail.renderer.computeResidual(environment)
            if (trailResidual != null) {
                residual.push(trailResidual)
            }
        })

        return residual
    }

    applyTimestamps(environment: EnvironmentState) {
        this.trails!.forEach((trail) => {
            trail.renderer.applyTimestamps(environment)
        })
    }

    destroy() {
        this.trails!.forEach((trail) => {
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

    if (execution.precondition == null || execution.postcondition == null) {
        throw new Error('Precondition or postcondition is null.')
    }

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
        const trailGroup: TrailState[] = convertEndOperationsAndLeavesToTrails(trace.value.id, endOperations, endLeaves)
        trails.push(...trailGroup)
    }

    // Remove duplicates
    for (let i = trails.length - 1; i >= 0; i--) {
        const s = JSON.stringify(trails[i])
        for (let j = i - 1; j >= 0; j--) {
            if (JSON.stringify(trails[j]) === s) {
                trails.splice(i, 1)
                break
            }
        }
    }

    return trails
}

export function convertEndOperationsAndLeavesToTrails(
    dataID: string,
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
        // AnimationTraceOperatorType.CreateVariable,
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
                fromDataIDs: [leaf.value.id],
                toDataID: dataID,
                operations: [op],
            })
        }
    }

    if (partial) {
        effects.push({
            type: TrailType.PartialCreate,
            fromDataIDs: leaves.map((leaf) => leaf.value?.id),
            toDataID: dataID,
            operations: clone(endOperations),
        })
    }

    if (effects.length == 0) {
        for (let i = 0; i < endOperations.length; i++) {
            const op = endOperations[i]
            const leaf = leaves[i]

            if (createTypes.includes(op.type) && creates.length === 0) {
                creates.push({
                    type: TrailType.Create,
                    toDataID: dataID,
                    operations: [op],
                })
            }
        }
    }

    return [...effects, ...creates]
}

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
