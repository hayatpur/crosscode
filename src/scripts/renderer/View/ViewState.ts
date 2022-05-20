import { EnvironmentState } from '../../environment/EnvironmentState'

/* --------------------- Definition --------------------- */
export interface ViewState {
    id: string

    preFrame: EnvironmentState
    frames: EnvironmentState[]
}

/* --------------------- Initializer -------------------- */
let __VIEW_ID = 0
export function createViewState(): ViewState {
    return {
        id: `View(${++__VIEW_ID})`,
        preFrame: null,
        frames: [],
    }
}
