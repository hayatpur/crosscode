import * as ESTree from 'estree'

export interface ViewTransform {
    dragging: boolean
    position: {
        x: number
        y: number
    }
    scale: number
    scaleMultiplier: number
}

export interface CodeAnchor {
    _type: 'CodeAnchor'
    loc: ESTree.SourceLocation
}

// Data state
export interface ViewState {
    _type: 'ViewState'

    id: string
    transform: ViewTransform

    // View status
    isCollapsed: boolean
    isShowingSteps: boolean
    isShowingTrace: boolean
    isShowingControlFlow: boolean
    isSeparated: boolean
    isHidden: boolean
    isPlayingAnimation: boolean
    isSelected: boolean
    isTemporary: boolean
    isEmbedded: boolean

    // Current selection state
    abstractionSelection: string
}

export function instanceOfViewState(state: any): state is ViewState {
    return state._type == 'ViewState'
}

let _VIEW_ID = 0
export function createViewState(): ViewState {
    return {
        _type: 'ViewState',
        id: `View(${++_VIEW_ID})`,
        transform: {
            dragging: false,
            position: {
                x: 0,
                y: 0,
            },
            scale: 1,
            scaleMultiplier: 1,
        },
        isCollapsed: true,
        isShowingSteps: false,
        isTemporary: false,
        isEmbedded: false,
        isShowingTrace: false,
        isShowingControlFlow: false,
        isSeparated: false,
        isHidden: false,
        isSelected: false,
        isPlayingAnimation: false,
        abstractionSelection: '',
    }
}
