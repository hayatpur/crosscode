// import { View } from '../View/View'
// import { TimelineController } from './TimelineController'
// import { TimelineRenderer } from './TimelineRenderer'
// import { createTimelineState, TimelineState } from './TimelineState'

// /* ------------------------------------------------------ */
// /*                  Timeline of an action                 */
// /* ------------------------------------------------------ */
// export class Timeline {
//     state: TimelineState
//     renderer: TimelineRenderer
//     controller: TimelineController

//     // Views
//     views: View[] = []
//     viewTimes: number[] = []

//     _initialized = false

//     constructor() {
//         this.state = createTimelineState()
//         this.renderer = new TimelineRenderer()
//         this.controller = new TimelineController(this)

//         this.renderer.render(this)

//         this._initialized = true
//     }

//     /* ----------------------- Destroy ---------------------- */
//     destroy() {
//         this.controller.destroy()
//         this.renderer.destroy()
//     }
// }
