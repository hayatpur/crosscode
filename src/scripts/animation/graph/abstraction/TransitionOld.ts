// import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
// import { clone } from '../../../utilities/objects'
// import {
//     AnimationNode,
//     ChunkNodeData,
//     instanceOfAnimationNode,
// } from '../../primitive/AnimationNode'
// import { initializeTransitionAnimation } from '../../primitive/Transition/InitializeTransitionAnimation'
// import { transitionCreateArray } from '../../primitive/Transition/Operations/CreateArrayTransitionAnimation'
// import { transitionCreate } from '../../primitive/Transition/Operations/CreateTransitionAnimation'
// import { transitionMove } from '../../primitive/Transition/Operations/MoveTransitionAnimation'
// import {
//     AnimationData,
//     AnimationGraph,
//     createAbstraction,
//     createAnimationGraph,
// } from '../AnimationGraph'
// import {
//     addVertex,
//     AnimationTraceChain,
//     AnimationTraceOperator,
//     getChunkTrace,
//     getUnionOfLocations,
// } from '../graph'
// import {
//     AbstractionSelection,
//     instanceOfAbstractionSelectionSingular,
// } from './Abstractor'

// // export interface Trace {
// //     operation: TraceOperation;
// //     value: any;
// //     location: any;
// // }

// // export enum TraceOperation {
// //     Move = 'Move',
// //     Combine = 'Add',
// //     NoChangeMove = 'NoChangeMove',
// // }

// /**
//  *
//  * @param parent
//  * @param selection
//  * @returns
//  */
// export function applyTransition(
//     parent: AnimationGraph | AnimationNode,
//     selection: AbstractionSelection
// ) {
//     if (instanceOfAnimationNode(parent)) {
//         return
//     }

//     // Get the animations
//     // const transitions = getTransitionsFromTrace(trace)

//     // Create new level of abstraction
//     const abstraction = createAbstraction()

//     const originalVertices = parent.abstractions[0].vertices
//     const vertices = []

//     // Instantiates all entities
//     for (let i = 0; i < selection.length; i++) {
//         const current = selection[i]

//         if (instanceOfAbstractionSelectionSingular(current)) {
//             const node = originalVertices.find(
//                 (vertex) => vertex.id === current.id
//             )
//             vertices.push(node)

//             if (current.selection != null) {
//                 applyTransition(node, current.selection)
//             }
//         } else {
//             const trace = getChunkTrace(parent, current)
//             const transitions = getTransitionsFromTrace(trace)

//             // Chunk
//             const nodes = originalVertices.filter(
//                 (vertex) => current.indexOf(vertex.id) != -1
//             )

//             if (nodes.length == 1 && instanceOfAnimationNode(nodes[0])) {
//                 vertices.push(nodes[0])
//             } else {
//                 // Begin transition graph
//                 const nodeData: ChunkNodeData = {
//                     location: getUnionOfLocations(
//                         nodes.map((v) => v.nodeData.location)
//                     ),
//                     type: nodes.map((v) => v.nodeData.type).join(', '),
//                     selection: current,
//                 }
//                 const graph: AnimationGraph = createAnimationGraph(nodeData)
//                 graph.isChunk = true

//                 const init = initializeTransitionAnimation(
//                     clone(nodes[nodes.length - 1].postcondition)
//                 )
//                 addVertex(graph, init, {
//                     nodeData: { ...nodeData, type: 'Transition Animation' },
//                 })

//                 vertices.push(graph)
//             }
//         }
//     }

//     abstraction.vertices = vertices
//     abstraction.about.selection = selection

//     // Add it to parent
//     parent.abstractions.push(abstraction)
//     parent.currentAbstractionIndex = parent.abstractions.length - 1
// }

// export interface TransitionAnimationNode extends AnimationNode {
//     applyInvariant: (
//         animation: TransitionAnimationNode,
//         view: PrototypicalEnvironmentState
//     ) => void
//     output: AnimationData
//     origins: AnimationData[]
// }

// function getTransitionsFromTrace(
//     trace: AnimationTraceChain[]
// ): TransitionAnimationNode[] {
//     const transitions: TransitionAnimationNode[] = []

//     for (const chain of trace) {
//         const [operations, leaves] = getAllOperationsAndLeaves(chain) // All operations and leaves (start output of data)

//         if (operations.length == 0) {
//             // No operations, meaning just preserve the data from previous
//             // operations.push(AnimationTraceOperator.MoveAndPlace)
//             // leaves.push({ value: chain.value })
//             continue
//         }

//         // Create a new animations from the chain
//         const transition = createTransitionAnimation(
//             chain.value,
//             operations,
//             leaves.map((leaf) => leaf.value)
//         )

//         transitions.push(transition)
//     }

//     return transitions
// }

// function createTransitionAnimation(
//     output: AnimationData,
//     operations: AnimationTraceOperator[],
//     origins: AnimationData[]
// ): TransitionAnimationNode {
//     const mapping = {
//         [AnimationTraceOperator.MoveAndPlace]: transitionMove,
//         [AnimationTraceOperator.CopyLiteral]: transitionMove,
//         [AnimationTraceOperator.CreateLiteral]: transitionCreate,
//         [AnimationTraceOperator.CreateArray]: transitionCreateArray,
//     }

//     // Transition animation is dominated by the last (lease recent) operator
//     const lastOperator = operations[operations.length - 1]
//     console.assert(
//         lastOperator in mapping,
//         'Last operator not in mapping',
//         operations
//     )

//     // Create the transition animation
//     const transition: TransitionAnimationNode = mapping[lastOperator](
//         output,
//         origins
//     )

//     return transition
// }

// function getAllOperationsAndLeaves(
//     chain: AnimationTraceChain
// ): [AnimationTraceOperator[], AnimationTraceChain[]] {
//     if (chain.children == null) return [[], []]

//     const operations: AnimationTraceOperator[] = []
//     const leaves: AnimationTraceChain[] = []

//     // TODO: Unique branches
//     for (const child of chain.children) {
//         const operator = child[0]
//         const value = child[1]

//         operations.push(operator)

//         if (value.children == null) {
//             leaves.push(value)
//         }

//         const [childOperations, childLeaves] = getAllOperationsAndLeaves(value)
//         operations.push(...childOperations)
//         leaves.push(...childLeaves)
//     }

//     return [operations, leaves]
// }
