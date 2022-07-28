// import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
// import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
// import { getLeafSteps } from '../../../utilities/action'
// import { createElement } from '../../../utilities/dom'
// import { lerp, overLerp } from '../../../utilities/math'
// import { Ticker } from '../../../utilities/Ticker'
// import { Executor } from '../../../visualization/Visualization'
// import { ActionMapping } from './ActionMapping'

// export class ActionMappingCursor {
//     element: HTMLElement
//     mapping: ActionMapping

//     private _tickerID: string
//     _currentFocus!: ExecutionGraph | ExecutionNode

//     dragging: boolean = false
//     private prevMouse: { x: number; y: number } = { x: 0, y: 0 }
//     targetTime: number = 0

//     private _speed: number = 0.2

//     isStatic: boolean = false
//     isHovering: boolean = false
//     updatedTargetTime: boolean = false

//     /* ----------------------- Create ----------------------- */
//     constructor(mapping: ActionMapping) {
//         this.mapping = mapping

//         this.element = createElement(
//             'div',
//             'action-cursor',
//             this.mapping.element
//         )

//         this.element.addEventListener('mousedown', (e) => {
//             this.dragging = true
//             this.prevMouse = { x: e.x, y: e.y }

//             this.targetTime = this.mapping.time

//             this.element.classList.add('is-dragging')
//         })

//         document.addEventListener('mousemove', (e) => {
//             if (this.dragging) {
//                 const yDelta = e.y - this.prevMouse.y

//                 this.targetTime += yDelta

//                 // Clamp time
//                 if (this.targetTime < 0) {
//                     this.targetTime = 0
//                 }

//                 this.targetTime = Math.min(
//                     this.targetTime,
//                     this.mapping.controlFlow.flowPath.getTotalLength() + 5
//                 )

//                 this.prevMouse = { x: e.x, y: e.y }
//                 e.stopPropagation()
//                 e.preventDefault()
//             }
//         })

//         document.addEventListener('mouseup', (e) => {
//             if (this.dragging) {
//                 this.dragging = false
//                 e.stopPropagation()
//                 e.preventDefault()

//                 this.element.classList.remove('is-dragging')
//             }
//         })

//         /* --- Arrow up and down used to go through the steps --- */
//         document.addEventListener('keydown', (e) => {
//             // if (e.key == 'ArrowUp') {
//             //     if (this.action.time > 0) {
//             //         this.action.time -= 1
//             //     }
//             // } else if (e.key == 'ArrowDown') {
//             //     const allSteps = this.action.getAllFrames()
//             //     if (this.action.time < allSteps.length - 1) {
//             //         this.action.time += 1
//             //     }
//             // }
//         })

//         this._tickerID = Ticker.instance.registerTick(this.tick.bind(this))
//     }

//     /* ----------------------- Update ----------------------- */
//     tick(dt: number) {
//         const initTime = this.mapping.time

//         // Move time along control flow path
//         const controlFlow = this.mapping.controlFlow

//         if (controlFlow.flowPath.pathLength.baseVal == 0) {
//             return
//         }

//         const { x, y } = controlFlow.flowPath.getPointAtLength(
//             this.mapping.time
//         )
//         this.element.style.left = `${x - 5}px`
//         this.element.style.top = `${y - 10}px`

//         // If not grabbing, then gravitate towards next action
//         const time = this.mapping.time
//         const steps = getLeafSteps(
//             Executor.instance.visualization.program.vertices
//         )

//         // console.log('Gets here.', !this.dragging)
//         if (!this.dragging && !this.isHovering) {
//             if (this.updatedTargetTime) {
//                 this._speed = lerp(this._speed, 0.05, 0.3)
//                 this.mapping.time = overLerp(
//                     this.mapping.time,
//                     this.targetTime,
//                     this._speed
//                 )

//                 if (this.mapping.time == this.targetTime) {
//                     this.updatedTargetTime = false
//                 }
//             } else {
//                 let candidate = 0
//                 let amount = 0
//                 let nextOffset = 0

//                 // Find the closest frame
//                 for (let i = steps.length - 1; i >= 0; i--) {
//                     const proxy = steps[i].proxy
//                     const start = proxy.timeOffset
//                     const end =
//                         start + proxy.element.getBoundingClientRect().height
//                     candidate = i
//                     if (time >= start) {
//                         nextOffset = end
//                         amount = end - start
//                         break
//                     }
//                 }

//                 if (candidate == -1) {
//                     return
//                 }

//                 if (amount > 0) {
//                     this._speed = lerp(this._speed, 0.05, 0.3)
//                     this.mapping.time = overLerp(time, nextOffset, this._speed)
//                     // this.mapping.time = Math.min(this.mapping.time, nextOffset - 0.01)
//                 }
//             }
//         } else if (!this.isHovering) {
//             // Find if it is on a frame currently
//             let isOnFrame = false
//             for (let i = steps.length - 1; i >= 0; i--) {
//                 const proxy = steps[i].proxy
//                 const start = proxy.timeOffset
//                 const end = start + proxy.element.getBoundingClientRect().height
//                 if (time >= start && time <= end) {
//                     isOnFrame = true
//                     break
//                 }
//             }
//             if (!isOnFrame) {
//                 this._speed = lerp(this._speed, 0.1, 0.3)
//             } else {
//                 this._speed = lerp(this._speed, 0.05, 0.3)
//             }

//             const xDelta = Math.abs(
//                 this.prevMouse.x - this.element.getBoundingClientRect().x
//             )
//             const xMult = Math.exp(-xDelta / 100)

//             this.mapping.time = overLerp(
//                 this.mapping.time,
//                 this.targetTime,
//                 this._speed * xMult
//             )
//         } else {
//             this.mapping.time += dt * 0.05
//             this.mapping.time = Math.min(
//                 this.mapping.time,
//                 this.mapping.controlFlow.flowPath.getTotalLength() + 5
//             )
//         }

//         // If time changed, then update
//         if (this.mapping.time != initTime || this.isHovering) {
//             Executor.instance.visualization.view.renderer.update()

//             // Update flow path
//             const controlFlow = this.mapping.controlFlow
//             controlFlow.flowPathCompleted.style.strokeDashoffset = `${
//                 controlFlow.flowPath.getTotalLength() - this.mapping.time
//             }`

//             this.isStatic = false
//         } else {
//             this.isStatic = true
//         }
//     }

//     /* ----------------------- Destroy ---------------------- */
//     destroy() {
//         Ticker.instance.removeTickFrom(this._tickerID)
//         this.element.remove()
//     }
// }
