import { ApplicationState } from '../ApplicationState'
import {
    ExecutionGraph,
    instanceOfExecutionGraph,
} from '../execution/graph/ExecutionGraph'
import {
    ExecutionNode,
    instanceOfExecutionNode,
} from '../execution/primitive/ExecutionNode'
import { ActionState } from '../renderer/Action/Action'
import { BinaryStatementRepresentation } from '../renderer/Action/Dynamic/BinaryExpressionRepresentation'
import { BlockStatementRepresentation } from '../renderer/Action/Dynamic/BlockStatementRepresentation'
import { CallExpressionRepresentation } from '../renderer/Action/Dynamic/CallExpressionRepresentation'
import { ForStatementRepresentation } from '../renderer/Action/Dynamic/ForStatementRepresentation'
import { FunctionCallRepresentation } from '../renderer/Action/Dynamic/FunctionCallRepresentation'
import { IfStatementRepresentation } from '../renderer/Action/Dynamic/IfStatementRepresentation'
import { ProgramRepresentation } from '../renderer/Action/Dynamic/ProgramRepresentation'
import { Representation } from '../renderer/Action/Dynamic/Representation'
import { ReturnStatementRepresentation } from '../renderer/Action/Dynamic/ReturnStatementRepresentation'
import { VariableDeclarationRepresentation } from '../renderer/Action/Dynamic/VariableDeclarationRepresentation'

/* ------------------------------------------------------ */
/*             Helper functions to for actions            */
/* ------------------------------------------------------ */

/**
 * @param parent
 * @returns leaf actions of the parent
 */
export function getLeavesOfAction(parent: ActionState): ActionState[] {
    let leaves: ActionState[] = []
    let candidates: ActionState[] = [parent]

    while (candidates.length > 0) {
        const candidate = candidates.pop() as ActionState
        if (candidate.vertices.length == 0) {
            leaves.push(candidate)
            continue
        }

        for (const stepID of candidate.vertices) {
            candidates.push(ApplicationState.actions[stepID])
        }
    }

    return leaves
}

/**
 * @param action
 * @param query
 * @returns action that satisfies the query or null
 */
export function queryAction(
    action: ActionState,
    query: (animation: ActionState) => boolean
): ActionState | null {
    if (query(action)) {
        return action
    }

    for (const stepID of action.vertices) {
        const ret = queryAction(ApplicationState.actions[stepID], query)
        if (ret != null) {
            return ret
        }
    }

    return null
}

export function queryAllAction(
    action: ActionState,
    query: (animation: ActionState) => boolean
): ActionState[] {
    const acc = []

    if (query(action)) {
        acc.push(action)
    }

    for (const stepID of action.vertices) {
        acc.push(...queryAllAction(ApplicationState.actions[stepID], query))
    }

    return acc
}

export function createRepresentation(action: ActionState) {
    let representation: typeof Representation = Representation

    if (action.execution.nodeData.type == undefined) {
        throw new Error('Action has no type.')
    }

    const mapping: { [key: string]: typeof Representation } = {
        IfStatement: IfStatementRepresentation,
        ForStatement: ForStatementRepresentation,
        VariableDeclaration: VariableDeclarationRepresentation,
        CallExpression: CallExpressionRepresentation,
        ReturnStatement: ReturnStatementRepresentation,
        BinaryExpression: BinaryStatementRepresentation,
        Program: ProgramRepresentation,
        FunctionCall: FunctionCallRepresentation,
        BlockStatement: BlockStatementRepresentation,
    }

    if (action.execution.nodeData.type in mapping) {
        representation = mapping[action.execution.nodeData.type]
    }

    return new representation(action)
}

export function getAllSteps(action: ActionState): ActionState[] {
    const allSteps = []

    let steps = action.vertices

    for (const stepID of steps) {
        const step = ApplicationState.actions[stepID]
        allSteps.push(step, ...getAllSteps(step))
    }

    return allSteps
}

export function getLabelOfExecution(execution: ExecutionGraph | ExecutionNode) {
    return (
        instanceOfExecutionNode(execution)
            ? execution.name
            : execution.nodeData.type ?? ''
    )
        .replace(/([A-Z])/g, ' $1')
        .trim()
}

export function getActionRootID(action: ActionState) {
    let root = action
    while (root.parentID != null) {
        root = ApplicationState.actions[root.parentID]
    }
    return root
}

export function getExecutionSteps(
    execution: ExecutionGraph | ExecutionNode
): (ExecutionGraph | ExecutionNode)[] {
    if (instanceOfExecutionGraph(execution) && !isPrimitive(execution)) {
        return execution.vertices
    } else {
        return []
    }
}

export function getLeafSteps(steps: ActionState[]): ActionState[] {
    const result: ActionState[] = []

    for (const action of steps) {
        if (action.vertices.length > 0) {
            result.push(
                ...getLeafSteps(
                    action.vertices.map((id) => ApplicationState.actions[id])
                )
            )
        } else {
            result.push(action)
        }
    }

    return result
}

export function getLeafStepsFromIDs(stepIDs: string[]): ActionState[] {
    const result: ActionState[] = []

    for (const stepID of stepIDs) {
        const step = ApplicationState.actions[stepID]

        if (step.vertices.length > 0) {
            result.push(...getLeafStepsFromIDs(step.vertices))
        } else {
            result.push(step)
        }
    }

    return result
}

export function getAbstractionPath(
    parent: ExecutionGraph | ExecutionNode,
    target: ExecutionGraph | ExecutionNode
): (ExecutionGraph | ExecutionNode)[] | null {
    if (parent == target) {
        return [parent]
    }

    if (instanceOfExecutionGraph(parent)) {
        for (const vertex of parent.vertices) {
            // if (instanceOfExecutionNode(vertex)) continue

            const ret = getAbstractionPath(vertex, target)

            if (ret != null) {
                return [parent, ...ret]
            }
        }
    }

    return null
}

export function queryExecutionGraph(
    animation: ExecutionGraph | ExecutionNode,
    query: (animation: ExecutionGraph | ExecutionNode) => boolean
): ExecutionGraph | ExecutionNode | null {
    if (query(animation)) {
        return animation
    }

    if (instanceOfExecutionGraph(animation)) {
        for (const vertex of animation.vertices) {
            const ret = queryExecutionGraph(vertex, query)
            if (ret != null) {
                return ret
            }
        }
    }

    return null
}

export function isPrimitive(execution: ExecutionGraph | ExecutionNode) {
    // if (execution.nodeData.preLabel == 'Name') {
    //     return true
    // }

    const primitives = new Set(['Literal', 'Identifier'])
    return primitives.has(execution.nodeData?.type ?? '')
}
