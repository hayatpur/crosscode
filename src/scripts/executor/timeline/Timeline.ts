// //@ts-check

// import { currentAbstraction, duration } from '../../animation/animation'
// import {
//     AnimationGraph,
//     instanceOfAnimationGraph,
// } from '../../animation/graph/AnimationGraph'
// import {
//     AnimationNode,
//     instanceOfAnimationNode,
// } from '../../animation/primitive/AnimationNode'
// import { remap } from '../../utilities/math'
// import { Executor } from '../Executor'
// import TimeSection from './TimeSection'

// export default class Timeline {
//     executor: Executor
//     scrubber: HTMLDivElement
//     scrubberParent: HTMLDivElement
//     held: boolean
//     sectionsDomElement: HTMLDivElement
//     sections: any[]

//     startTimes: { [key: string]: number } = {}

//     constructor(executor: Executor) {
//         this.executor = executor

//         // Scrubber
//         this.scrubber = document.getElementById(
//             'time-scrubber'
//         ) as HTMLDivElement
//         this.scrubberParent = this.scrubber.parentElement as HTMLDivElement

//         this.held = false

//         const timeline = this

//         const m = 1.11

//         this.scrubberParent.onmousedown = (e) => {
//             this.held = true

//             const bbox = this.scrubberParent.getBoundingClientRect()

//             console.log(this.scrubberParent)
//             console.log(bbox)

//             // Move scrubber over
//             let x = m * (e.x - bbox.x)

//             // Clamp
//             x = Math.max(0, x)
//             x = Math.min(x, m * bbox.width)

//             this.scrubber.style.left = `${x}px`
//             this.scrubber.classList.add('active')
//         }

//         // document.body.addEventListener('mousemove', (e) => {
//         //     if (!this.held) return

//         //     const bbox = this.scrubberParent.getBoundingClientRect()

//         //     // Move scrubber over
//         //     let x = m * (e.x - bbox.x)

//         //     // Clamp
//         //     x = Math.max(0, x)
//         //     x = Math.min(x, m * bbox.width)

//         //     this.scrubber.style.left = `${x}px`

//         //     executor.time = remap(
//         //         x,
//         //         0,
//         //         bbox.width,
//         //         0,
//         //         duration(executor.animation)
//         //     )
//         //     executor.timeline.seek(executor.time)

//         //     executor.render()
//         // })

//         // document.body.addEventListener('mouseup', () => {
//         //     if (!this.held) return

//         //     this.held = false
//         //     this.scrubber.classList.remove('active')
//         // })

//         // // Pause binding
//         // document
//         //     .getElementById('pause-button')
//         //     .addEventListener('click', (e) => {
//         //         executor.paused = true
//         //         document.getElementById('pause-button').classList.add('active')
//         //         document
//         //             .getElementById('play-button')
//         //             .classList.remove('active')
//         //     })

//         // // Play binding
//         // document
//         //     .getElementById('play-button')
//         //     .addEventListener('click', (e) => {
//         //         executor.paused = false
//         //         document.getElementById('play-button').classList.add('active')
//         //         document
//         //             .getElementById('pause-button')
//         //             .classList.remove('active')
//         //     })

//         // Sections
//         this.sectionsDomElement = document.createElement('div')
//         this.sectionsDomElement.classList.add('time-sections')

//         this.scrubberParent.append(this.sectionsDomElement)

//         this.sections = []
//     }

//     destroySections() {
//         document
//             .querySelectorAll('.time-section')
//             .forEach((section) => section.remove())
//         this.sections = []
//     }

//     updateSections() {
//         this.destroySections()
//         const total_duration = duration(this.executor.animation)
//         this.updateAnimationGraph(this.executor.animation, 0, total_duration)
//     }

//     updateAnimationGraph(
//         animation: AnimationGraph,
//         start: number,
//         total_duration: number
//     ) {
//         this.startTimes[animation.id] = start

//         if (animation.isChunk) {
//             return this.updateAnimationNode(animation, start, total_duration)
//         }

//         const { vertices } = animation

//         const { isParallel, parallelStarts } = animation

//         for (let i = 0; i < vertices.length; i++) {
//             let child = vertices[i]

//             if (instanceOfAnimationGraph(child)) {
//                 if (isParallel) {
//                     this.updateAnimationGraph(
//                         child,
//                         start + parallelStarts[i],
//                         total_duration
//                     )
//                 } else {
//                     start = this.updateAnimationGraph(
//                         child,
//                         start,
//                         total_duration
//                     )
//                 }
//             } else {
//                 if (isParallel) {
//                     this.updateAnimationNode(
//                         child,
//                         start + parallelStarts[i],
//                         total_duration,
//                         i / (vertices.length - 1)
//                     )
//                 } else {
//                     start = this.updateAnimationNode(
//                         child,
//                         start,
//                         total_duration
//                     )
//                 }
//             }
//         }

//         if (isParallel) {
//             start += duration(animation)
//         }

//         return start
//     }

//     updateAnimationNode(
//         animation: AnimationNode | AnimationGraph,
//         start: number,
//         total_duration: number,
//         yOffset = 0.5
//     ): number {
//         start += animation.delay
//         this.startTimes[animation.id] = start

//         const section = new TimeSection(
//             this.scrubberParent,
//             instanceOfAnimationNode(animation)
//                 ? animation.name
//                 : animation.nodeData.type,
//             start,
//             duration(animation),
//             animation.delay,
//             total_duration,
//             yOffset
//         )
//         this.sections.push(section)

//         start += duration(animation)

//         return start
//     }

//     seek(t) {
//         const bbox = this.scrubberParent.getBoundingClientRect()

//         // Move scrubber over
//         this.scrubber.style.left = `${remap(
//             t,
//             0,
//             duration(this.executor.animation),
//             0,
//             bbox.width
//         )}px`

//         for (const section of this.sections) {
//             if (t >= section.start && t <= section.start + section.duration) {
//                 section.highlight()
//             } else {
//                 section.unHighlight()
//             }
//         }
//     }
// }
