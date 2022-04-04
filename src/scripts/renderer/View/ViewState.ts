/* --------------------- Definition --------------------- */
export interface ViewState {
    id: string
    time: number
}

/* --------------------- Initializer -------------------- */
let __VIEW_ID = 0
export function createViewState(): ViewState {
    return {
        id: `View(${++__VIEW_ID})`,
        time: 0,
    }
}
