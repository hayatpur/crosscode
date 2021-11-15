import { CursorState } from '../animation/Cursor'
import { Transform } from '../environment/data/DataState'
import { ConcreteEnvironmentState, PrototypicalEnvironmentState } from '../environment/EnvironmentState'

export interface EnvironmentViewMapping {
    f: (env: PrototypicalEnvironmentState) => PrototypicalEnvironmentState
}

// A leaf view is a rendering of the program state under some mapping.
export interface LeafViewState {
    _type: 'LeafViewState'
    _environment: ConcreteEnvironmentState // Cached environment from last update

    isActive: boolean
    lastActive: number

    id: string
    label: string

    transform: Transform
    mapping: EnvironmentViewMapping
}

// A group view is a collection of leaf views
export interface GroupViewState {
    _type: 'GroupViewState'

    id: string
    label: string

    isActive: boolean
    lastActive: number

    transform: GroupViewTransform
    children: (GroupViewState | LeafViewState)[]
}

// The root view contains all views as well as the true environment
export interface RootViewState extends Omit<GroupViewState, '_type'> {
    _type: 'RootViewState'
    environment: PrototypicalEnvironmentState // The true program state / environment
    cursor: CursorState
}

export interface GroupViewTransform extends Transform {
    // Anchors to align it to lines of code, or to other views
    positionModifiers: GroupViewPositionModifier[]
}

export interface GroupViewPositionModifier {
    type: GroupViewPositionModifierType
    value: any
}

export enum GroupViewPositionModifierType {
    NextToCode = 'NextToCode',
    AboveView = 'AboveView',
    BelowView = 'BelowView',
}

export function instanceOfGroupView(groupView: any): groupView is GroupViewState {
    return groupView['_type'] == 'GroupViewState'
}

export function instanceOfRootView(rootView: any): rootView is GroupViewState {
    return rootView['_type'] == 'RootViewState'
}

export function instanceOfLeafView(leafView: any): leafView is LeafViewState {
    return leafView['_type'] == 'LeafViewState'
}
