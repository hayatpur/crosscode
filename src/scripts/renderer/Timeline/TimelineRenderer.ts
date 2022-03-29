// import { createEl } from '../../utilities/dom'
// import { Timeline } from './Timeline'

// /* ------------------------------------------------------ */
// /*                    Timeline renderer                   */
// /* ------------------------------------------------------ */
// export class TimelineRenderer {
//     element: HTMLElement

//     baseElement: HTMLElement
//     // cursorElement: HTMLElement
//     // movingCursorElement: HTMLElement

//     /* ----------------------- Create ----------------------- */
//     constructor() {
//         this.create()
//     }

//     create() {
//         this.element = createEl('div', 'timeline')
//         this.baseElement = createEl('div', 'timeline-base', this.element)
//         // this.movingCursorElement = createEl('div', 'timeline-moving-cursor', this.element)
//         // this.cursorElement = createEl('div', 'timeline-cursor', this.element)
//     }

//     /* ----------------------- Render ----------------------- */

//     updateClasses(timeline: Timeline) {
//         // Root
//         timeline.state.isRoot
//             ? this.element.classList.add('root')
//             : this.element.classList.remove('root')

//         // Showing steps
//         timeline.state.isShowingSteps
//             ? this.element.classList.add('showing-steps')
//             : this.element.classList.remove('showing-steps')

//         // Cursor
//         // timeline.state.isShowingSteps
//         //     ? this.cursorElement.classList.add('showing-steps')
//         //     : this.cursorElement.classList.remove('showing-steps')

//         // // Moving cursor
//         // timeline.state.isShowingSteps
//         //     ? this.movingCursorElement.classList.add('showing-steps')
//         //     : this.movingCursorElement.classList.remove('showing-steps')
//     }

//     render(timeline: Timeline) {
//         // Set position of steps and views
//         if (timeline.state.isShowingSteps) {
//             let viewIndex = 0
//             for (let i = 0; i < timeline.steps.length; i++) {
//                 if (viewIndex <= timeline.views.length) {
//                     const viewTime = timeline.viewTimes[viewIndex]
//                     if (viewTime <= i) {
//                         const view = timeline.views[viewIndex]
//                         this.element.appendChild(view.renderer.element)
//                         viewIndex++
//                     }
//                 }

//                 const step = timeline.steps[i]
//                 this.element.appendChild(step.renderer.element)
//             }

//             // Any left-over view
//             if (viewIndex <= timeline.views.length) {
//                 const viewTime = timeline.viewTimes[viewIndex]
//                 if (viewTime <= timeline.steps.length) {
//                     const view = timeline.views[viewIndex]
//                     this.element.appendChild(view.renderer.element)
//                     viewIndex++
//                 }
//             }
//         }

//         // Update classes
//         this.updateClasses(timeline)

//         // Set cursor position
//         this.renderTime(timeline)
//     }

//     renderTime(timeline: Timeline) {
//         const timelineBbox = this.element.getBoundingClientRect()

//         // if (timeline.state.isShowingSteps) {
//         //     const currentIndex = Math.round(timeline.state.currentTime)
//         //     const currentStep = timeline.steps[currentIndex]
//         //     const currentStepBbox = currentStep.renderer.label.getBoundingClientRect()
//         //     let y = currentStepBbox.y + 16 - timelineBbox.y
//         //     this.cursorElement.style.top = `${y}px`

//         //     // Move in between steps
//         //     // const leftOver = timeline.state.currentTime - currentIndex // [-0.5, 0.5]
//         //     // if (leftOver != 0) {
//         //     //     let leftOverStep: Action = null

//         //     //     if (leftOver > 0) {
//         //     //         leftOverStep = timeline.steps[currentIndex + 1]
//         //     //     } else {
//         //     //         leftOverStep = timeline.steps[currentIndex - 1]
//         //     //     }

//         //     //     const leftOverStepBbox = leftOverStep.renderer.label.getBoundingClientRect()
//         //     //     y =
//         //     //         lerp(currentStepBbox.y, leftOverStepBbox.y, Math.abs(leftOver)) +
//         //     //         16 -
//         //     //         timelineBbox.y
//         //     // }

//         //     this.movingCursorElement.style.top = `${y}px`
//         // } else {
//         //     this.cursorElement.style.top = '0px'
//         //     this.movingCursorElement.style.top = '0px'
//         // }

//         // const baseBbox = this.baseElement.getBoundingClientRect()
//         // this.cursorElement.style.left = `${baseBbox.x - timelineBbox.x}px`
//         // this.movingCursorElement.style.left = `${baseBbox.x - timelineBbox.x}px`
//     }

//     updateConnections(timeline: Timeline) {}

//     /* ----------------------- Destroy ---------------------- */
//     destroy() {
//         this.element.remove()
//     }
// }

// /* ------------------ Helper functions ------------------ */
