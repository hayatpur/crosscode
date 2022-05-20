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
    isInline: boolean
    isIndented: boolean
    isShowingSteps: boolean
    isExpression: boolean
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
        isInline: false,
        isIndented: false,
        isShowingSteps: false,
        isExpression: false,
    }

    return { ...base, ...overrides }
}
