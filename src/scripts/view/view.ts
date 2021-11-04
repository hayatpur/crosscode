import { createTransform } from '../environment/data/data'
import { createEnvironment } from '../environment/environment'
import { EnvironmentState, instanceOfEnvironment } from '../environment/EnvironmentState'
import { clone } from '../utilities/objects'
import { ViewState } from './ViewState'

let CUR_VIEW_ID = 0

export function createView(
    options: { noChildren?: boolean; isRoot?: boolean } = { noChildren: false, isRoot: false }
): ViewState {
    return {
        _type: 'ViewState',
        id: `View(${++CUR_VIEW_ID})`,
        transform: {
            ...createTransform(),
            styles: {},
            positionModifiers: [],
            classList: ['view-i'],
        },
        children: options.noChildren ? [] : [createEnvironment()],
        label: '',
        isRoot: options.isRoot ? true : false,
    }
}

export function getCurrentEnvironment(view: ViewState): EnvironmentState {
    const lastChild = view.children[view.children.length - 1]

    if (instanceOfEnvironment(lastChild)) {
        return lastChild
    } else {
        return getCurrentEnvironment(lastChild)
    }
}

export function getPreviousEnvironment(view: ViewState): EnvironmentState {
    const lastChild = view.children[view.children.length - 2]
    if (lastChild == null) return null

    if (instanceOfEnvironment(lastChild)) {
        return lastChild
    } else {
        return getCurrentEnvironment(lastChild)
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
