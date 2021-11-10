import { Transform } from '../environment/data/DataState'
import { EnvironmentState } from '../environment/EnvironmentState'

// A view is a collection of environments
export interface ViewState {
    _type: 'ViewState'

    id: string
    label: string
    isRoot: boolean
    isActive: boolean
    lastActive: number

    transform: ViewTransform
    children: (ViewState | EnvironmentState)[]
}

export interface ViewTransform extends Transform {
    // Anchors to align it to lines of code, or to other views
    positionModifiers: ViewPositionModifier[]
}

export interface ViewPositionModifier {
    type: ViewPositionModifierType
    value: any
}

export enum ViewPositionModifierType {
    NextToCode = 'NextToCode',
    AboveView = 'AboveView',
    BelowView = 'BelowView',
}

export function instanceOfView(view: any): view is ViewState {
    return view['_type'] == 'ViewState'
}
