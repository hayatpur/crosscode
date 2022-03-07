import { Timeline } from './Timeline'

/* ------------------------------------------------------ */
/*          Defines interactions with a Timeline          */
/* ------------------------------------------------------ */
export class TimelineController {
    timeline: Timeline

    constructor(timeline: Timeline) {
        this.timeline = timeline
    }

    /* ----------------- Collapse and expand ---------------- */

    collapse() {
        this.timeline.state.isCollapsed = true
        // TODO
    }

    expand() {
        this.timeline.state.isCollapsed = false
        // TODO
    }

    /* ---------------- Show before and after --------------- */

    showBeforeAndAfter() {
        this.timeline.state.isShowingBeforeAndAfter = true
        // TODO
    }

    hideBeforeAndAfter() {
        this.timeline.state.isShowingBeforeAndAfter = false
        // TODO
    }

    /* --------------------- Show steps --------------------- */

    // TODO: Be able to specify what steps to show
    showSteps() {
        this.timeline.state.isShowingSteps = true
        // TODO
    }

    hideSteps() {
        this.timeline.state.isShowingSteps = false
        // TODO
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {}
}
