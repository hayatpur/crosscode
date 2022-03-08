/* --------------------- Definition --------------------- */
export interface ViewState {
    id: string
}

/* --------------------- Initializer -------------------- */
let __VIEW_ID = 0
export function createViewState(): ViewState {
    return {
        id: `View(${++__VIEW_ID})`,
    }
}
