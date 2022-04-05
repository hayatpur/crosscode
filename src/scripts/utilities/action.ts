import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../execution/primitive/ExecutionNode'
import { Action } from '../renderer/Action/Action'
import { BlockStatementRepresentation } from '../renderer/Action/Dynamic/BlockStatementRepresentation'
import { CallExpressionRepresentation } from '../renderer/Action/Dynamic/CallExpressionRepresentation'
import { ForStatementRepresentation } from '../renderer/Action/Dynamic/ForStatementRepresentation'
import { FunctionCallRepresentation } from '../renderer/Action/Dynamic/FunctionCallRepresentation'
import { Representation } from '../renderer/Action/Dynamic/Representation'
import { WhileStatementRepresentation } from '../renderer/Action/Dynamic/WhileStatementRepresentation'

/* ------------------------------------------------------ */
/*             Helper functions to for actions            */
/* ------------------------------------------------------ */

/**
 * @param action
 * @returns abstraction depth of the action
 */
// export function getDepth(action: Action | ActionBundle): number {
//     if (action.steps.length == 0) {
//         return 1
//     } else {
//         return 1 + Math.max(...action.steps.map((step) => getDepth(step)))
//     }
// }

/**
 * @param parent
 * @returns leaf actions of the parent
 */
export function getLeavesOfAction(parent: Action): Action[] {
    let leaves: Action[] = []
    let candidates: Action[] = [parent]

    while (candidates.length > 0) {
        const candidate = candidates.pop()
        if (candidate.steps.length == 0) {
            leaves.push(candidate)
            continue
        }

        for (const step of candidate.steps) {
            if (step instanceof Action) {
                candidates.push(step)
            }
        }
    }

    return leaves
}

/**
 * @param action
 * @param query
 * @returns action that satisfies the query or null
 */
export function queryAction(action: Action, query: (animation: Action) => boolean): Action {
    if (query(action)) {
        return action
    }

    for (const step of action.steps) {
        const ret = queryAction(step, query)
        if (ret != null) {
            return ret
        }
    }

    return null
}

export function queryAllAction(action: Action, query: (animation: Action) => boolean): Action[] {
    const acc = []

    if (query(action)) {
        acc.push(action)
    }

    for (const step of action.steps) {
        acc.push(...queryAllAction(step, query))
    }

    return acc
}

export function createRepresentation(action: Action) {
    let representation: typeof Representation = null
    switch (action.execution.nodeData.type) {
        case 'CallExpression':
            representation = CallExpressionRepresentation
            break
        case 'FunctionCall':
            representation = FunctionCallRepresentation
            break
        case 'ForStatement':
            representation = ForStatementRepresentation
            break
        case 'Program':
            representation = BlockStatementRepresentation
            break
        case 'BlockStatement' || 'Program':
            representation = BlockStatementRepresentation
            break
        case 'WhileStatement':
            representation = WhileStatementRepresentation
            break
        default:
            representation = Representation
            break
    }

    return new representation(action)
}

export function getAllSteps(action: Action): Action[] {
    const allSteps = []

    let steps = action.steps

    for (const step of steps) {
        allSteps.push(step, ...getAllSteps(step))
    }

    return allSteps
}

export function isExpandable(execution: ExecutionGraph | ExecutionNode) {
    const expandibleTypes = new Set([
        'ForStatement',
        'WhileStatement',
        'IfStatement',
        'FunctionCall',
    ])

    return expandibleTypes.has(execution.nodeData.type)
}

export function getLabelOfExecution(execution: ExecutionGraph | ExecutionNode) {
    return (instanceOfExecutionNode(execution) ? execution.name : execution.nodeData.type)
        .replace(/([A-Z])/g, ' $1')
        .trim()
}
