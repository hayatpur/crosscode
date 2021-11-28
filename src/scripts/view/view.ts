import { createCursorState } from '../animation/Cursor'
import { createTransform } from '../environment/data/data'
import { createPrototypicalEnvironment } from '../environment/environment'
import { PrototypicalEnvironmentState } from '../environment/EnvironmentState'
import { updateRootViewLayout } from '../environment/layout'
import { clone } from '../utilities/objects'
import { GroupViewState, instanceOfLeafView, LeafViewState, RootViewState } from './ViewState'

let CUR_VIEW_ID = 0

export function createGroupView(): GroupViewState {
    return {
        _type: 'GroupViewState',
        id: `View(${++CUR_VIEW_ID})`,
        transform: {
            ...createTransform(),
            styles: {},
            positionModifiers: [],
            classList: ['view-i'],
        },
        isActive: false,
        lastActive: 0,
        children: [],
        label: '',
    }
}

export function createLeafViewState(): LeafViewState {
    return {
        _type: 'LeafViewState',
        id: `View(${++CUR_VIEW_ID})`,
        transform: {
            ...createTransform(),
            styles: {},
            classList: ['leaf-view-i'],
        },
        isActive: false,
        lastActive: 0,
        _environment: null,
        mapping: {
            f: (env: PrototypicalEnvironmentState) => clone(env),
        },
        label: '',
    }
}

export function createRootView(): RootViewState {
    const root: RootViewState = {
        ...createGroupView(),
        _type: 'RootViewState',
        environment: createPrototypicalEnvironment(),
        cursor: createCursorState(),
    }

    // Create a new view
    const newView = createLeafViewState()
    newView.label = 'Program'

    // Add the new view to the current view state
    root.children.push(newView)
    newView.isActive = true
    newView.lastActive = performance.now()

    updateRootViewLayout(root)

    return root
}

export function cloneGroupView(view: GroupViewState, assignNewId: boolean = false): GroupViewState {
    return {
        ...clone(view),
        id: assignNewId ? `View(${++CUR_VIEW_ID})` : clone(view.id),
    }
}

export function cloneRootView(view: RootViewState, assignNewId: boolean = false): RootViewState {
    return {
        ...clone(view),
        id: assignNewId ? `View(${++CUR_VIEW_ID})` : clone(view.id),
    }
}

export function replaceGroupViewWith(current: GroupViewState, newView: GroupViewState) {
    const clone = cloneGroupView(newView)
    current.id = clone.id
    current.label = clone.label
    current.transform = clone.transform
    current.children = clone.children
}

export function replaceRootViewWith(current: RootViewState, newView: RootViewState) {
    const clone = cloneRootView(newView)
    current.id = clone.id
    current.label = clone.label
    current.transform = clone.transform
    current.children = clone.children
    current.environment = clone.environment
    current.cursor = clone.cursor
}

export function getFlattenedChildren(view: RootViewState | GroupViewState): (GroupViewState | LeafViewState)[] {
    const children = []

    for (const child of view.children) {
        children.push(child)

        if (!instanceOfLeafView(child)) {
            children.push(...getFlattenedChildren(child))
        }
    }

    return children
}

export function getCurrentLeafView(view: GroupViewState | RootViewState): LeafViewState {
    const children = getFlattenedChildren(view)
    for (const child of children) {
        if (instanceOfLeafView(child) && child.isActive) {
            return child
        }
    }
}

export function getLastActiveLeafView(view: GroupViewState | RootViewState): LeafViewState {
    let children = getFlattenedChildren(view)
    children = children.filter((child) => instanceOfLeafView(child) && !child.isActive)

    // Return child with the largest lastActive
    if (children.length == 0) {
        console.warn('No last active view, returning current view')
        return getCurrentLeafView(view)
    }

    return children.reduce((candidate, other) =>
        candidate.lastActive > other.lastActive ? candidate : other
    ) as LeafViewState
}

export function findViewById(view: GroupViewState | RootViewState, id: string): GroupViewState | LeafViewState {
    const children = getFlattenedChildren(view)
    for (const child of children) {
        if (child.id === id) {
            return child
        }
    }
}

export function findLeafViewById(view: GroupViewState | RootViewState, id: string): LeafViewState {
    const children = getFlattenedChildren(view)
    for (const child of children) {
        if (instanceOfLeafView(child) && child.id === id) {
            return child
        }
    }
}
