import { createTransform } from '../environment/data/data'
import { EnvironmentState, instanceOfEnvironment } from '../environment/EnvironmentState'
import { clone } from '../utilities/objects'
import { instanceOfView, ViewState } from './ViewState'

let CUR_VIEW_ID = 0

export function createView(options: { isRoot?: boolean } = { isRoot: false }): ViewState {
    return {
        _type: 'ViewState',
        id: `View(${++CUR_VIEW_ID})`,
        transform: {
            ...createTransform(),
            styles: {},
            positionModifiers: [],
            classList: ['view-i'],
        },
        isActive: false,
        lastActive: -1,
        children: [],
        label: '',
        isRoot: options.isRoot ? true : false,
    }
}

export function getCurrentEnvironmentInView(view: ViewState): EnvironmentState {
    const lastChild = view.children[view.children.length - 1]

    if (instanceOfEnvironment(lastChild)) {
        return lastChild
    } else {
        return getCurrentEnvironment(lastChild)
    }
}

export function getPreviousEnvironmentInView(view: ViewState): EnvironmentState {
    const lastChild = view.children[view.children.length - 2]
    if (lastChild == null) return null

    if (instanceOfEnvironment(lastChild)) {
        return lastChild
    } else {
        return getCurrentEnvironment(lastChild)
    }
}

export function getCurrentEnvironment(view: ViewState): EnvironmentState {
    // Find the current view
    const active = view.children.find((child) => instanceOfView(child) && child.isActive) as ViewState

    if (active != null) {
        return getCurrentEnvironmentInView(active)
    } else {
        for (const child of view.children) {
            if (instanceOfView(child)) {
                const environment = getCurrentEnvironment(child)
                if (environment != null) {
                    return environment
                }
            }
        }
        return null
    }
}

export function getActiveView(view: ViewState): ViewState {
    // Find the current view
    const active = view.children.find((child) => instanceOfView(child) && child.isActive) as ViewState

    if (active != null) {
        return active
    } else {
        for (const child of view.children) {
            if (instanceOfView(child)) {
                const v = getActiveView(child)
                if (v != null) {
                    return v
                }
            }
        }
        return null
    }
}

export function getLastActiveEnvironment(view: ViewState): EnvironmentState {
    // Find all child views
    const views = getFlattenedChildren(view).filter((child) => instanceOfView(child)) as ViewState[]

    let candidate: ViewState = null
    let max = -1
    for (const child of views) {
        if (child.lastActive > max) {
            max = child.lastActive
            candidate = child
        }
    }

    if (candidate == null || candidate.lastActive < 0) {
        return null
    } else {
        return getCurrentEnvironmentInView(candidate)
    }
}

/**
 * @param environment
 * @returns Returns a deep clone of the view
 */
export function cloneView(view: ViewState, assignNewId: boolean = false): ViewState {
    return {
        _type: 'ViewState',
        id: assignNewId ? `View(${++CUR_VIEW_ID})` : clone(view.id),
        label: clone(view.label),
        isRoot: clone(view.isRoot),
        transform: clone(view.transform),
        children: clone(view.children),
        isActive: clone(view.isActive),
        lastActive: clone(view.lastActive),
    }
}

export function replaceViewWith(current: ViewState, newView: ViewState) {
    const clone = cloneView(newView)
    current.id = clone.id
    current.label = clone.label
    current.isRoot = clone.isRoot
    current.transform = clone.transform
    current.children = clone.children
}

export function getFlattenedChildren(view: ViewState): (ViewState | EnvironmentState)[] {
    const children = []

    for (const child of view.children) {
        children.push(child)

        if (instanceOfView(child)) {
            children.push(...getFlattenedChildren(child))
        }
    }

    return children
}

export function findViewById(view: ViewState, id: string): ViewState {
    const children = getFlattenedChildren(view)
    for (const child of children) {
        if (instanceOfView(child) && child.id === id) {
            return child
        }
    }
}

export function findEnvironmentById(view: ViewState, id: string): EnvironmentState {
    const children = getFlattenedChildren(view)
    for (const child of children) {
        if (instanceOfEnvironment(child) && child.id === id) {
            return child
        }
    }
}
