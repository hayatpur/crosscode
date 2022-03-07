// Action state

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

    // Status
    isCollapsed: boolean
    isShowingSteps: boolean
}

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
        isCollapsed: false,
        isShowingSteps: false,
    }
}
