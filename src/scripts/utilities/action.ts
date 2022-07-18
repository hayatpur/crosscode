import { ExecutionGraph, instanceOfExecutionGraph } from '../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../execution/primitive/ExecutionNode'
import { Action } from '../renderer/Action/Action'
import { ForStatementRepresentation } from '../renderer/Action/Dynamic/ForStatementRepresentation'
import { IfStatementRepresentation } from '../renderer/Action/Dynamic/IfStatementRepresentation'
import { Representation } from '../renderer/Action/Dynamic/Representation'

/* ------------------------------------------------------ */
/*             Helper functions to for actions            */
/* ------------------------------------------------------ */

/**
 * @param parent
 * @returns leaf actions of the parent
 */
export function getLeavesOfAction(parent: Action): Action[] {
    let leaves: Action[] = []
    let candidates: Action[] = [parent]

    while (candidates.length > 0) {
        const candidate = candidates.pop() as Action
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
export function queryAction(action: Action, query: (animation: Action) => boolean): Action | null {
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
    let representation: typeof Representation = Representation

    switch (action.execution.nodeData.type) {
        case 'IfStatement':
            representation = IfStatementRepresentation
            break
        // case 'CallExpression':
        //     representation = CallExpressionRepresentation
        //     break
        // case 'FunctionCall':
        //     representation = FunctionCallRepresentation
        //     break
        case 'ForStatement':
            representation = ForStatementRepresentation
            break
        // case 'Program':
        //     representation = BlockStatementRepresentation
        //     break
        // case 'BlockStatement':
        //     representation = BlockStatementRepresentation
        //     break
        // case 'WhileStatement':
        //     representation = WhileStatementRepresentation
        //     break
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

export function getLabelOfExecution(execution: ExecutionGraph | ExecutionNode) {
    return (instanceOfExecutionNode(execution) ? execution.name : execution.nodeData.type ?? '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
}

export function getActionRoot(action: Action) {
    let root = action
    while (root.parent != null) {
        root = root.parent
    }
    return root
}

export function getExecutionSteps(execution: ExecutionGraph | ExecutionNode): (ExecutionGraph | ExecutionNode)[] {
    if (instanceOfExecutionGraph(execution)) {
        return execution.vertices
    } else {
        return []
    }
}

export function getLeafSteps(steps: Action[]): Action[] {
    const result: Action[] = []

    for (const action of steps) {
        if (action.steps.length > 0) {
            result.push(...getLeafSteps(action.steps))
        } else {
            result.push(action)
        }
    }

    return result
}

export function getAbstractionPath(
    parent: ExecutionGraph,
    target: ExecutionGraph | ExecutionNode
): (ExecutionGraph | ExecutionNode)[] | null {
    if (parent == target) {
        return [parent]
    }

    if (instanceOfExecutionGraph(parent)) {
        for (const vertex of parent.vertices) {
            if (instanceOfExecutionNode(vertex)) continue

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
): ExecutionGraph | ExecutionNode {
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
