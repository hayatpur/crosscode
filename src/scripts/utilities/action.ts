import { Action } from '../renderer/Action/Action'

/* ------------------------------------------------------ */
/*             Helper functions to for actions            */
/* ------------------------------------------------------ */

/**
 * @param action
 * @returns abstraction depth of the action
 */
export function getDepth(action: Action): number {
    if (!action.timeline.state.isShowingSteps) {
        return 1
    } else {
        return 1 + Math.max(...action.timeline.steps.map((step) => getDepth(step)))
    }
}

/**
 * @param parent
 * @returns leaf actions of the parent
 */
export function getLeavesOfAction(parent: Action): Action[] {
    let leaves: Action[] = []
    let candidates: Action[] = [parent]

    while (candidates.length > 0) {
        const candidate = candidates.pop()
        if (!candidate.timeline.state.isShowingSteps) {
            leaves.push(candidate)
            continue
        }

        for (const step of candidate.timeline.steps) {
            candidates.push(step)
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

    if (action.timeline.state.isShowingSteps) {
        for (const step of action.timeline.steps) {
            const ret = queryAction(step, query)
            if (ret != null) {
                return ret
            }
        }
    }

    return null
}

export function queryAllAction(action: Action, query: (animation: Action) => boolean): Action[] {
    const acc = []

    if (query(action)) {
        acc.push(action)
    }

    if (action.timeline.state.isShowingSteps) {
        for (const step of action.timeline.steps) {
            acc.push(...queryAllAction(step, query))
        }
    }

    return acc
}
