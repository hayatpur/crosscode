/* ------------------------------------------------------ */
/*                     Timeline State                     */
/* ------------------------------------------------------ */

/* --------------------- Definition --------------------- */
export interface TimelineState {
    id: string

    isCollapsed: boolean
    isRoot: boolean
    isShowingSteps: boolean
}

/* ------------------- Initialization ------------------- */
let __TIMELINE_ID = 0
export function createTimelineState(): TimelineState {
    return {
        id: `Timeline(${++__TIMELINE_ID})`,
        isCollapsed: false,
        isShowingSteps: false,
        isRoot: false,
    }
}
