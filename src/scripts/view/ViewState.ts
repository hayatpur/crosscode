import * as ESTree from 'estree'

export interface ViewTransform {
    dragging: boolean
    position: {
        x: number
        y: number
    }
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

    // Animation time
    time: number
    speed: number
    isPlaying: boolean
    hasPlayed: boolean
    isPaused: boolean

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
        },
        isCollapsed: true,
        isShowingSteps: false,
        time: 0,
        isPaused: true,
        speed: 1 / 100,
        isPlaying: false,
        hasPlayed: false,
        abstractionSelection: '',
    }
}
