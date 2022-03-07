// import { EnvironmentState } from '../../environment/EnvironmentState'
// import { reads, writes } from '../../execution/execution'
// import { clone } from '../../utilities/objects'
// import { EnvironmentRenderer } from './EnvironmentRenderer'

// export interface AnimationRendererRepresentation {
//     // exclude: string[] | null // List of data ids to exclude from the representation, or null to include all
//     // include: string[] | null // List of data ids to include in the representation, or null to include all, prioritized over exclude
//     reads: string[]
//     writes: string[]
// }

// let ANIMATION_RENDERER_ID = 0

// export class AnimationRenderer {
//     id: string

//     // State
//     view: View

//     // Rendering
//     preEnvironmentRenderer: EnvironmentRenderer
//     environmentRenderer: EnvironmentRenderer
//     postEnvironmentRenderer: EnvironmentRenderer

//     environment: EnvironmentState = null
//     element: HTMLDivElement = null

//     preRendererElement: HTMLDivElement = null
//     postRendererElement: HTMLDivElement = null

//     showingPostRenderer: boolean = true
//     showingPreRenderer: boolean = false

//     representation: AnimationRendererRepresentation

//     constructor(view: View) {
//         this.id = `AR(${ANIMATION_RENDERER_ID++})`

//         this.element = document.createElement('div')
//         this.element.classList.add('animation-renderer')

//         this.preRendererElement = document.createElement('div')
//         this.preRendererElement.classList.add('animation-renderers-pre')
//         this.element.appendChild(this.preRendererElement)

//         this.postRendererElement = document.createElement('div')
//         this.postRendererElement.classList.add('animation-renderers-post')
//         this.element.appendChild(this.postRendererElement)

//         this.environmentRenderer = new EnvironmentRenderer()
//         this.element.appendChild(this.environmentRenderer.element)

//         this.postEnvironmentRenderer = new EnvironmentRenderer()
//         this.postRendererElement.appendChild(this.postEnvironmentRenderer.element)

//         this.preEnvironmentRenderer = new EnvironmentRenderer()
//         this.preRendererElement.appendChild(this.preEnvironmentRenderer.element)

//         this.view = view
//         this.environment = clone(this.view.originalExecution.postcondition)
//         this.environment.renderer = this.environmentRenderer

//         this.environmentRenderer.preRenderer = this.preEnvironmentRenderer
//         this.environmentRenderer.postRenderer = this.postEnvironmentRenderer

//         // Create representations
//         this.updateRepresentation()
//     }

//     select(selection: Set<string>) {
//         this.environmentRenderer.select(selection)
//     }

//     deselect() {
//         this.environmentRenderer.deselect()
//     }

//     updateRepresentation() {
//         const ws = writes(this.view.originalExecution).map((w) => w.id)

//         const rs = reads(this.view.originalExecution)
//             .map((r) => r.id)
//             .filter((id) => !id.includes('BindFunctionNew'))

//         this.representation = {
//             reads: rs,
//             writes: ws,
//         }
//     }

//     destroy() {
//         this.environmentRenderer.destroy()
//         this.postEnvironmentRenderer.destroy()
//         this.preEnvironmentRenderer.destroy()
//         this.element.remove()
//     }

//     update() {
//         // Update the environment
//         this.environmentRenderer.setState(this.environment, this.representation)
//         // this.propagateEnvironmentPaths(this.environment, this.environmentRenderer)
//         // this.environmentRenderer.setState(this.environment, this.representation)

//         // Update the post environment
//         if (this.showingPostRenderer) {
//             this.postEnvironmentRenderer.setState(
//                 this.view.originalExecution.postcondition,
//                 this.representation
//             )
//         }

//         if (this.showingPreRenderer) {
//             this.preEnvironmentRenderer.setState(
//                 this.view.originalExecution.precondition,
//                 this.representation
//             )
//         }
//     }

//     separate() {
//         this.preRendererElement.classList.add('visible')
//         this.showingPreRenderer = true
//         this.preRendererElement.classList.add('separated')

//         this.environmentRenderer.separated = true

//         this.update()
//     }

//     unSeparate(hidePreRenderer: boolean) {
//         this.preRendererElement.classList.remove('separated')
//         this.environmentRenderer.separated = false

//         if (hidePreRenderer) {
//             this.showingPreRenderer = false
//         }
//     }

//     showTrace() {
//         this.preRendererElement.classList.add('visible')
//         this.showingPreRenderer = true

//         this.update()
//     }

//     hideTrace(hidePreRenderer: boolean) {
//         if (hidePreRenderer) {
//             this.preRendererElement.classList.remove('visible')
//             this.showingPreRenderer = false
//         }

//         this.update()
//     }

//     tick(dt: number) {
//         this.preEnvironmentRenderer.tick(dt)
//         this.environmentRenderer.tick(dt)
//         this.postEnvironmentRenderer.tick(dt)

//         // Update the post environment
//         if (this.showingPostRenderer) {
//             const bbox = this.postRendererElement.getBoundingClientRect()
//             this.element.style.minWidth = `${bbox.width}px`
//             this.element.style.minHeight = `${bbox.height - 10}px`
//         }
//     }
// }
