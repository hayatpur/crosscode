// import { getArrow } from 'curved-arrows'
// import { LiteralRenderer } from '../../environment/data/literal/LiteralRenderer'
// import { AnimationTraceChain, queryExecutionGraph } from '../../execution/execution'
// import { Executor } from '../../executor/Executor'
// import { View } from '../Action/Action'
// import { TraceOperator } from './TraceOperator'
// import { getAllBranches, getAllOperationsAndLeaves } from './Transition'

// // A single trace
// export class Trace {
//     chain: AnimationTraceChain
//     view: View

//     startElement: HTMLElement
//     endElement: HTMLElement

//     // Connection
//     connection: SVGPathElement
//     traceIndicator: HTMLElement
//     endArrow: SVGPolygonElement

//     operations: TraceOperator[] = []

//     arrowHeadSize = 3

//     constructor(view: View, chain: AnimationTraceChain) {
//         this.view = view
//         this.chain = chain

//         this.connection = document.createElementNS('http://www.w3.org/2000/svg', 'path')
//         this.connection.classList.add('trace-connection')
//         document.getElementById('svg-canvas').append(this.connection)

//         this.traceIndicator = document.createElement('div')
//         this.traceIndicator.classList.add('trace-indicator')
//         document.body.append(this.traceIndicator)

//         // this.startCircle = document.createElementNS(
//         //     'http://www.w3.org/2000/svg',
//         //     'circle'
//         // )
//         // this.startCircle.classList.add('trace-start-circle')
//         // this.startCircle.setAttribute('r', '2')
//         // document.getElementById('svg-canvas').append(this.startCircle)

//         this.endArrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
//         this.endArrow.classList.add('trace-end-arrow')
//         this.endArrow.setAttribute(
//             'points',
//             `0,${-this.arrowHeadSize} ${this.arrowHeadSize * 2},0, 0,${this.arrowHeadSize}`
//         )
//         document.getElementById('svg-canvas').append(this.endArrow)

//         // this.interactableElement = document.createElement('div')
//         // this.interactableElement.classList.add('trace-interactable')
//         // document.body.append(this.interactableElement)

//         // this.interactableElement.addEventListener('mouseover', () => {

//         // })

//         // this.interactableElement.addEventListener('mouseout', () => {
//         //     this.tooltip?.remove()
//         // })
//     }

//     select() {
//         this.connection.classList.add('selected')
//     }

//     deselect() {
//         this.connection.classList.remove('selected')
//     }

//     tick(dt: number) {
//         if (this.startElement != null && this.endElement != null) {
//             const startBbox = this.startElement.getBoundingClientRect()
//             const endBbox = this.endElement.getBoundingClientRect()

//             let start = {
//                 x: startBbox.x + startBbox.width / 2,
//                 y: startBbox.y + startBbox.height / 2,
//             }
//             let end = {
//                 x: endBbox.x + endBbox.width / 2,
//                 y: endBbox.y + endBbox.height / 2,
//             }

//             if (this.view.state.isSeparated) {
//                 start.y += startBbox.height / 2
//                 end.y -= endBbox.height / 2
//             }

//             let mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }

//             if (this.view.state.isSeparated) {
//                 const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getArrow(
//                     start.x,
//                     start.y,
//                     end.x,
//                     end.y,
//                     {
//                         padEnd: 0,
//                         padStart: 0,
//                     }
//                 )
//                 this.connection.setAttribute(
//                     'd',
//                     `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
//                 )
//             } else {
//                 // Convex
//                 let convex = start.x < end.x
//                 mid.y += (convex ? 1 : -1) * Math.abs(end.x - start.x) * 0.5
//                 this.connection.setAttribute(
//                     'd',
//                     `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`
//                 )
//             }

//             for (let i = 0; i < this.operations.length; i++) {
//                 this.operations[i].tick(dt)
//                 const operationElement = this.operations[i].element
//                 const deviation = i - this.operations.length / 2 + 0.5

//                 const pt = this.connection.getPointAtLength(
//                     this.connection.getTotalLength() -
//                         80 * Executor.instance.PARAMS.b +
//                         deviation * 20 * Executor.instance.PARAMS.a
//                 )

//                 operationElement.style.left = `${pt.x}px`
//                 operationElement.style.top = `${pt.y}px`
//             }
//         } else {
//             this.connection.setAttribute('d', '')
//             this.traceIndicator.style.opacity = '0'
//         }
//     }

//     show() {
//         const animationRenderer = this.view.renderer.animationRenderer
//         if (animationRenderer == null) {
//             return
//         }

//         // Pre-environment data
//         const preEnvironmentRenderers =
//             animationRenderer.preEnvironmentRenderer.getAllChildRenderers()
//         for (const id of Object.keys(preEnvironmentRenderers)) {
//             if (!(preEnvironmentRenderers[id] instanceof LiteralRenderer)) {
//                 delete preEnvironmentRenderers[id]
//             }
//         }

//         // Environment data
//         const environmentRenderers =
//             animationRenderer.postEnvironmentRenderer.getAllChildRenderers()
//         for (const id of Object.keys(environmentRenderers)) {
//             if (!(environmentRenderers[id] instanceof LiteralRenderer)) {
//                 delete environmentRenderers[id]
//             }
//         }

//         const [operations, leaves] = getAllOperationsAndLeaves(this.chain)

//         // console.log(this.chain)

//         // Set end element
//         const end = this.chain.value
//         if (!(end.id in environmentRenderers)) {
//             return
//         }
//         this.endElement = environmentRenderers[end.id].element

//         // Set start element
//         if (operations.length == 0) {
//             // No operations, meaning just preserve the data from previous
//             if (preEnvironmentRenderers[end.id] != null) {
//                 this.startElement = null
//                 // this.startElement = preEnvironmentRenderers[end.id].element
//             }
//         } else {
//             const branches = getAllBranches(this.chain)

//             if (branches.length == 1) {
//                 const branch = branches[0]
//                 const start = leaves[0].value

//                 if (start != null && preEnvironmentRenderers[start.id] != null) {
//                     this.startElement = preEnvironmentRenderers[start.id].element
//                 } else {
//                     this.startElement = null
//                 }
//             } else {
//                 console.warn("Can't handle multiple branches")
//             }
//         }

//         // Create operations
//         operations.reverse()

//         // Group nodes into chunks
//         // const chunkedOperations = getDeepestChunks(
//         //     Executor.instance.execution,
//         //     new Set(operations.map((o) => o.executionId))
//         // )
//         // console.log(new Set(operations.map((o) => o.executionId)))

//         // for (const op of chunkedOperations) {
//         //     this.operations.push(new TraceOperator(op))
//         // }
//         // this.animationSelection = this.animationSelection.map((chunk) => stripChunk(chunk))

//         for (const op of operations) {
//             const executionNode = queryExecutionGraph(
//                 this.view.originalExecution,
//                 (e) => e.id == op.executionId
//             )
//             this.operations.push(new TraceOperator(executionNode))
//         }
//     }

//     hide() {
//         this.startElement = null
//         this.endElement = null
//     }

//     destroy() {
//         this.connection.remove()
//         this.traceIndicator.remove()
//         this.endArrow.remove()

//         for (const op of this.operations) {
//             op.destroy()
//         }
//         this.operations = []
//     }
// }
