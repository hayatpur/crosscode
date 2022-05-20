// import * as monaco from 'monaco-editor'
// import { Editor } from '../../../editor/Editor'
// import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
// import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
// import { Action } from '../Action'
// import { getExecutionSteps } from '../ActionController'
// import { Representation } from './Representation'

// export class ForStatementRepresentation extends Representation {
//     loopRect: HTMLElement = null

//     constructor(action: Action) {
//         super(action, 2)
//     }

//     applyRepresentation() {
//         if (this.totalRepresentations === 0) {
//             return
//         }

//         this.action.controller.destroyStepsAndViews()

//         let relevantViewsPerIteration: (ExecutionGraph | ExecutionNode)[][] = []

//         if (this.currentRepresentation == 1) {
//             this.action.steps = []

//             let steps = getExecutionSteps(this.action.execution)
//             let iterations = (steps.length - 2) / 3

//             for (let iter = 0; iter < iterations; iter++) {
//                 relevantViewsPerIteration[iter] = []

//                 if (iter == 0) {
//                     // Variable initialization
//                     const initializer = steps[0]
//                     const initializerAction = new Action(initializer, this.action, {
//                         spacingDelta: 0,
//                         inline: true,
//                         inSitu: true,
//                         skipOver: true,
//                     })
//                     this.action.steps.push(initializerAction)
//                     relevantViewsPerIteration[iter].push(initializer)
//                 }

//                 // Comparison
//                 const comparison = steps[iter * 3 + 1]
//                 const comparisonAction = new Action(comparison, this.action, {
//                     spacingDelta: 0,
//                     inline: true,
//                     inSitu: true,
//                     skipOver: true,
//                 })
//                 this.action.steps.push(comparisonAction)
//                 relevantViewsPerIteration[iter].push(comparison)

//                 // Loop body
//                 const body = steps[iter * 3 + 2]
//                 const bodyAction = new Action(body, this.action, {
//                     spacingDelta: 0,
//                     inline: true,
//                     // inSitu: iter != 0,
//                     stripped: true,
//                     // skipOver: true,
//                 })
//                 this.action.steps.push(bodyAction)
//                 relevantViewsPerIteration[iter].push(body)

//                 // Loop increment
//                 const increment = steps[iter * 3 + 3]
//                 const incrementAction = new Action(increment, this.action, {
//                     spacingDelta: 0,
//                     inline: true,
//                     inSitu: true,
//                     skipOver: true,
//                 })
//                 this.action.steps.push(incrementAction)
//                 // relevantViewsPerIteration[iter].push(increment)
//                 //     if (i == 0) {
//                 //         // Initializer

//                 //     } else if (i % 3 == ) {
//                 //     }
//                 //     const step = steps[i]

//                 //     // Compute any line difference
//                 //     let delta = 0
//                 //     if (i < steps.length - 1) {
//                 //         let currEnd = step.nodeData.location.end.line
//                 //         let nextStart = steps[i + 1].nodeData.location.start.line
//                 //         delta = Math.min(Math.max(nextStart - currEnd - 1, 0), 1)
//                 //     }

//                 //     const action = new Action(step, this.action, {
//                 //         spacingDelta: delta,
//                 //         inline: true,
//                 //     })
//                 //     this.action.steps.push(action)
//             }

//             // for (const iters of relevantViewsPerIteration) {
//             //     spatialRoot.controller.createView(iters)
//             // }

//             // // Add a view if not inline
//             // if (this.action.state.inline) {
//             //     const root = this.action.controller.getSpatialRoot()
//             //     root.controller.updateStepToViewMappings()
//             // } else {
//             //     this.action.controller.updateStepToViewMappings()
//             // }

//             // Render them so they're in the right place
//             this.action.renderer.render(this.action)
//         }

//         const spatialRoot = this.action.controller.getSpatialRoot()
//         spatialRoot.mapping.updateSteps()
//         // Update temporal overlaps
//         this.action.controller.updateTemporalOverlaps()
//         // console.log(this.action.views)
//     }

//     setSourceCodeOfExecution() {
//         // Header
//         const range = this.action.execution.nodeData.location
//         let headerLabel = Editor.instance.monaco.getModel().getValueInRange({
//             startLineNumber: range.start.line,
//             startColumn: range.start.column + 1,
//             endLineNumber: range.end.line,
//             endColumn: range.end.column + 1,
//         })

//         this.action.renderer.footerPreLabel.innerText = ''
//         this.action.renderer.footerLabel.innerText = ''

//         let footerLabel = null
//         let footerLineNumbers = `${this.action.execution.nodeData.location.end.line}`
//         let headerLineNumbers = this.action.execution.nodeData.location.start.line.toString()

//         // Label
//         if (this.currentRepresentation == 0) {
//             headerLabel = `for ( ... ) { ... }`
//             if (this.action.steps.length > 0) {
//                 headerLabel = `for ( ... ) {`
//                 footerLabel = '}'
//             }
//         } else {
//             let upTill = headerLabel.substring(0, headerLabel.indexOf('{')).trim()
//             headerLabel = `${upTill} {`
//             footerLabel = '}'
//         }

//         // Spacing
//         if (this.action.state.spacingDelta > 0) {
//             if (footerLineNumbers == null) {
//                 footerLineNumbers = `${(
//                     this.action.execution.nodeData.location.end.line + 1
//                 ).toString()}`
//             } else {
//                 footerLineNumbers += `\n${(
//                     this.action.execution.nodeData.location.end.line + 1
//                 ).toString()}`
//             }
//         }

//         // Set the line numbers
//         this.action.renderer.headerPreLabel.innerText = headerLineNumbers
//         if (footerLineNumbers != null) {
//             this.action.renderer.footerPreLabel.innerText = footerLineNumbers
//         }

//         // Render labels
//         monaco.editor.colorize(headerLabel, 'javascript', {}).then((result) => {
//             if (this.action?.renderer?.headerLabel != null) {
//                 this.action.renderer.headerLabel.innerHTML = result

//                 //     if (this.currentRepresentation == 1) {
//                 //         const spans = [
//                 //             ...this.action.renderer.headerLabel.children[0].children,
//                 //         ] as HTMLSpanElement[]
//                 //         for (let i = 1; i < spans.length; i++) {
//                 //             if (spans[i].innerText.includes('{')) {
//                 //                 break
//                 //             }
//                 //             spans[i].classList.add('faded-out-span')
//                 //         }
//                 //     }
//             }
//         })

//         if (footerLabel != null) {
//             monaco.editor.colorize(footerLabel, 'javascript', {}).then((result) => {
//                 if (this.action?.renderer?.footerLabel != null) {
//                     this.action.renderer.footerLabel.innerHTML = result
//                 }
//             })
//         }
//     }
// }
