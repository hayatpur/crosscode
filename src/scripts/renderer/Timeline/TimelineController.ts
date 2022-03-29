// import { ExecutionGraph, instanceOfExecutionGraph } from '../../execution/graph/ExecutionGraph'
// import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
// import { Executor } from '../../executor/Executor'
// import { Ticker } from '../../utilities/Ticker'
// import { Action } from '../Action/Action'
// import { View } from '../View/View'
// import { Timeline } from './Timeline'

// /* ------------------------------------------------------ */
// /*          Defines interactions with a Timeline          */
// /* ------------------------------------------------------ */
// export class TimelineController {
//     timeline: Timeline
//     _tickerId: string
//     _focus: ExecutionGraph | ExecutionNode
//     _prevTime: number

//     constructor(timeline: Timeline) {
//         this.timeline = timeline
//         this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))

//         document.addEventListener('keydown', (e) => {
//             if (e.key == 'ArrowUp') {
//                 if (this.timeline.state.currentTime > 0) {
//                     this.timeline.state.currentTime -= 1
//                 }
//             } else if (e.key == 'ArrowDown') {
//                 if (this.timeline.state.currentTime < this.timeline.steps?.length - 1) {
//                     this.timeline.state.currentTime += 1
//                 }
//             }
//         })
//     }

//     /* --------------------- Show steps --------------------- */

//     // TODO: Be able to specify what steps to show
//     showSteps() {
//         this.timeline.state.isShowingSteps = true

//         // Create steps
//         // TODO: Deal with execution nodes
//         this.timeline.steps = []
//         this.timeline.views = []
//         this.timeline.viewTimes = []

//         let steps = getExecutionSteps(this.timeline.action.execution)

//         for (let i = 0; i < steps.length; i++) {
//             const step = steps[i]

//             // Compute any line difference
//             let delta = 0
//             if (i < steps.length - 1) {
//                 let currEnd = step.nodeData.location.end.line
//                 let nextStart = steps[i + 1].nodeData.location.start.line
//                 delta = Math.min(Math.max(nextStart - currEnd - 1, 0), 1)
//             }

//             const action = new Action(step, {
//                 shouldShowSteps: false,
//                 spacingDelta: delta,
//                 parentTimeline: this.timeline,
//             })
//             this.timeline.steps.push(action)

//             // Add a view if root
//             if (this.timeline.state.isRoot && i == steps.length - 1) {
//                 const view = new View()
//                 view.controller.setEnvironments([action.execution.postcondition])

//                 this.timeline.views.push(view)
//                 this.timeline.viewTimes.push(steps.length)
//             }
//         }

//         // Render them so they're in the right place
//         this.timeline.renderer.render(this.timeline)
//     }

//     showNewSteps() {
//         // this.timeline.state.isShowingSteps = true
//         // this.timeline.state.isShowingNewSteps = true
//         // // Create a new timeline
//         // const newAction = new Action(this.timeline.action.execution, {
//         //     isRoot: true,
//         //     shouldShowSteps: true,
//         //     shouldExpand: true,
//         // })
//         // const camera = Executor.instance.visualization.camera
//         // camera.add(newAction.renderer.element)
//         // const bbox = this.timeline.action.renderer.element.getBoundingClientRect()
//         // const vizBbox = Executor.instance.visualization.element.getBoundingClientRect()
//         // newAction.state.transform.position.x = bbox.x + bbox.width - vizBbox.x
//         // const newBbox = newAction.renderer.element.getBoundingClientRect()
//         // newAction.state.transform.position.y = bbox.y + bbox.height / 2 - newBbox.height / 2
//     }

//     hideSteps() {
//         this.timeline.state.isShowingSteps = false

//         // Destroy steps
//         this.timeline.steps?.forEach((step) => step.destroy())
//         this.timeline.steps = null

//         // Render again
//         this.timeline.renderer.render(this.timeline)
//     }

//     /* ------------------------ Time ------------------------ */
//     tick(dt: number) {
//         if (!this.timeline._initialized) return
//         // if (this.timeline.state.isPlaying) {
//         //     this.timeline.state.currentTime += dt * this.timeline.state.playbackSpeed
//         //     const duration = this.timeline.steps?.length - 1 ?? 0

//         //     if (this.timeline.state.currentTime > duration) {
//         //         this.timeline.state.currentTime = duration
//         //         this.timeline.state.isPlaying = false
//         //     }
//         // }

//         // Focus on current step
//         if (
//             this.timeline.state.isShowingSteps &&
//             Math.round(this.timeline.state.currentTime) != this._prevTime
//         ) {
//             const step = this.timeline.steps[Math.round(this.timeline.state.currentTime)]
//             if (this._focus != null) {
//                 Executor.instance.visualization.focus.clearFocus(this._focus)
//             }
//             Executor.instance.visualization.focus.focusOn(step.execution)
//             this._focus = step.execution

//             this._prevTime = Math.round(this.timeline.state.currentTime)

//             this.timeline.renderer.renderTime(this.timeline)

//             if (this.timeline.state.isRoot) {
//                 this.timeline.views[this.timeline.views.length - 1].controller.setEnvironments([
//                     step.execution.postcondition,
//                 ])
//             } else {
//                 this.timeline.subView.controller.setEnvironments([step.execution.postcondition])
//             }
//         }
//     }

//     /* ----------------------- Destroy ---------------------- */
//     destroy() {
//         Ticker.instance.removeTickFrom(this._tickerId)
//     }
// }

// /* ------------------------------------------------------ */
// /*                    Helper functions                    */
// /* ------------------------------------------------------ */
// // ? Apply blacklist
// export function getExecutionSteps(
//     execution: ExecutionGraph | ExecutionNode
// ): (ExecutionGraph | ExecutionNode)[] {
//     if (instanceOfExecutionGraph(execution)) {
//         return execution.vertices
//     } else {
//         return []
//     }
// }
