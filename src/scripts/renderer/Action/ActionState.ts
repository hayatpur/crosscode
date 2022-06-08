/* ------------------------------------------------------ */
/*                      Action state                      */
/* ------------------------------------------------------ */

/* --------------------- Definition --------------------- */

export interface ActionState {
    id: string

    // Transform
    position: {
        x: number
        y: number
    }
    scale: number

    // State
    isShowingSteps: boolean
}

/* --------------------- Initializer -------------------- */
let __ACTION_ID = 0
export function createActionState(overrides: Partial<ActionState> = {}): ActionState {
    const base: ActionState = {
        id: `Action(${++__ACTION_ID})`,
        position: {
            x: 0,
            y: 0,
        },
        scale: 1,
        isShowingSteps: false,
    }

    return { ...base, ...overrides }
}
