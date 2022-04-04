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

    spacingDelta: number
    inline: boolean
    inSitu: boolean

    isFocusedStep: boolean
    isSelected: boolean
    isShowingView: boolean
}

/* --------------------- Initializer -------------------- */
let __ACTION_ID = 0
export function createActionState(): ActionState {
    return {
        id: `Action(${++__ACTION_ID})`,
        position: {
            x: 0,
            y: 0,
        },
        scale: 1,
        spacingDelta: 0,
        inline: false,
        inSitu: false,
        isFocusedStep: false,
        isSelected: false,
        isShowingView: true,
    }
}
