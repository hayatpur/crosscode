/* ------------------------------------------------------ */
/*                      Action state                      */
/* ------------------------------------------------------ */

/* --------------------- Definition --------------------- */
export interface ActionTransform {
    position: {
        x: number
        y: number
    }
    scale: number
}

export interface ActionState {
    id: string

    // Transform
    transform: ActionTransform
}

/* --------------------- Initializer -------------------- */
let __ACTION_ID = 0
export function createActionState(): ActionState {
    return {
        id: `Action(${++__ACTION_ID})`,
        transform: {
            position: {
                x: 0,
                y: 0,
            },
            scale: 1,
        },
    }
}
