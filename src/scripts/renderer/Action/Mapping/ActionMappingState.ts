/* --------------------- Definition --------------------- */
export interface ActionMappingState {
    isHidden: boolean
}

/* --------------------- Initializer -------------------- */
export function createActionMappingState(): ActionMappingState {
    return {
        isHidden: false,
    }
}
