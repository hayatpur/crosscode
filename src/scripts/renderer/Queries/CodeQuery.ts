// import * as ESTree from 'estree'
// import { getDepthOfExecution, queryExecutionGraph } from '../../execution/execution'
// import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
// import { ExecutionNode, instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
// import { Executor } from '../../executor/Executor'
// import { getClosestMatch } from '../../utilities/math'
// import { Action } from '../Action/Action'

// export interface CodeQueryState {
//     // selection: { x: number; y: number; width: number; height: number } | null
//     selection: ESTree.SourceLocation
// }

// export class CodeQuery {
//     query: CodeQueryState

//     actions: Action[] = []
//     parents: Action[] = []

//     constructor(query: CodeQueryState) {
//         this.query = query

//         // List of base nodes
//         // const nodes = queryAllExecutionGraph(Executor.instance.execution, (animation) =>
//         //     instanceOfExecutionNode(animation)
//         // )

//         // Find nodes that are inside the selection
//         // const selectedNodeIds: Set<string> = new Set()

//         // for (const node of nodes) {
//         //     const location = node.nodeData.location
//         //     const bbox = Editor.instance.computeBoundingBoxForLoc(location)

//         //     const contains = bboxContains(this.query.selection, bbox)

//         //     if (contains) {
//         //         selectedNodeIds.add(node.id)
//         //     }
//         // }

//         // Group nodes into chunks
//         // let executionSelection = getDeepestChunks(Executor.instance.execution, selectedNodeIds)
//         // executionSelection = executionSelection.map((chunk) => stripChunk(chunk))

//         let executionSelection = getClosestMatch(query.selection) ?? []
//         executionSelection.sort((a, b) => {
//             const aDepth = getDepthOfExecution(a, Executor.instance.execution)
//             const bDepth = getDepthOfExecution(b, Executor.instance.execution)

//             return aDepth - bDepth
//         })

//         console.log(executionSelection)

//         for (const execution of executionSelection) {
//             // Two cases:
//             // 1. If the execution is already shown, just highlight it

//             // 2. If the execution is not shown, create it
//             const parent = getParentInRoot(execution)
//             const action = new Action(execution, parent, {
//                 inline: true,
//                 spacingDelta: 0,
//             })

//             parent.steps.push(action)
//             parent.renderer.render(parent)

//             // const spatialRoot = parent.controller.getSpatialRoot()
//             // spatialRoot.mapping.updateSteps()
//             // Update temporal overlaps
//             parent.controller.updateTemporalOverlaps()
//             parent.representation.render()

//             this.actions.push(action)
//             this.parents.push(parent)
//         }
//     }

//     destroy() {
//         // console.log('Destroying...')
//         // console.log(this.actions, this.parents)

//         for (let i = this.actions.length - 1; i >= 0; i--) {
//             const action = this.actions[i]
//             const parent = this.parents[i]

//             parent.controller.removeStep(action)
//             action.destroy()
//         }
//         this.actions = []
//         this.parents = []
//     }
// }

// // Expand the root Action to include the step
// export function getParentInRoot(goal: ExecutionGraph | ExecutionNode): Action {
//     let parent: Action = Executor.instance.visualization.root
//     // let views = []

//     while (true) {
//         if (instanceOfExecutionNode(parent.execution.id)) {
//             if (parent.execution.id == goal.id) {
//                 return parent
//             } else {
//                 console.warn('Animation not found - reached end')
//                 break
//             }
//         }

//         let foundMatch = false
//         for (const step of parent.steps) {
//             // TODO support bundles

//             const contains =
//                 queryExecutionGraph(step.execution, (animation) => animation.id == goal.id) != null

//             if (contains) {
//                 parent = step
//                 foundMatch = true
//                 break
//             }
//         }

//         if (!foundMatch) {
//             return parent
//         }
//     }

//     return null
// }
