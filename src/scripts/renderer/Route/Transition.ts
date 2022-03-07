// import { AnimationGraph, AnimationNode, createAnimationGraph } from '../../animation/animation'
// import { AnimationRendererRepresentation } from '../../environment/AnimationRenderer'
// import { EnvironmentState } from '../../environment/EnvironmentState'
// import {
//     AnimationTraceChain,
//     AnimationTraceOperator,
//     AnimationTraceOperatorType,
//     getTrace,
//     reads,
//     writes,
// } from '../../execution/execution'
// import { DataInfo, ExecutionGraph } from '../../execution/graph/ExecutionGraph'
// import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
// import { initializeTransitionAnimation } from '../../execution/primitive/Transition/InitializeTransitionAnimation'
// import { transitionCreateArray } from '../../execution/primitive/Transition/Operations/CreateArrayTransitionAnimation'
// import { transitionCreateReference } from '../../execution/primitive/Transition/Operations/CreateReferenceTransitionAnimation'
// import { transitionCreate } from '../../execution/primitive/Transition/Operations/CreateTransitionAnimation'
// import { transitionCreateVariable } from '../../execution/primitive/Transition/Operations/CreateVariableTransitionAnimation'
// import { transitionMove } from '../../execution/primitive/Transition/Operations/MoveTransitionAnimation'
// import { transitionPlace } from '../../execution/primitive/Transition/Operations/PlaceTransitionAnimation'
// import { clone } from '../../utilities/objects'

// export interface TransitionAnimationNode extends AnimationNode {
//     applyInvariant: (animation: TransitionAnimationNode, environment: EnvironmentState) => void
//     output: DataInfo
//     origins: DataInfo[]
// }

// /**
//  * Creates an animation from a graph
//  * @param node
//  * @returns
//  */
// export function createTransition(
//     node: ExecutionNode | ExecutionGraph,
//     representation: AnimationRendererRepresentation = null
// ): AnimationGraph {
//     const transition = createAnimationGraph()
//     transition.id = `Transition(${node.id})`

//     // Initialize to the post condition
//     if (representation == null) {
//         const ws = writes(node).map((w) => w.id)
//         const rs = reads(node)
//             .map((r) => r.id)
//             .filter((id) => !id.includes('BindFunctionNew'))

//         representation = {
//             reads: rs,
//             writes: ws,
//         }

//         console.warn('Setting default representation...')
//     }

//     const init = initializeTransitionAnimation(node.postcondition, representation)
//     transition.vertices.push(init)

//     // if (instanceOfExecutionNode(node)) {
//     //     return transition
//     // }

//     console.log(clone(node))
//     const trace = getTrace(node)
//     const transitions = getTransitionsFromTrace(trace)

//     // Add all the transitions
//     for (const t of transitions) {
//         transition.vertices.push(t)
//     }

//     // Make it parallel
//     transition.isParallel = true
//     transition.parallelStarts = [0, ...transitions.map((_) => 1)]

//     return transition
// }

// function getTransitionsFromTrace(trace: AnimationTraceChain[]): TransitionAnimationNode[] {
//     const transitions: TransitionAnimationNode[] = []

//     for (const chain of trace) {
//         const [operations, leaves] = getAllOperationsAndLeaves(chain) // All operations and leaves (start output of data)

//         if (operations.length == 0) {
//             // No operations, meaning just preserve the data from previous
//             continue
//         }

//         /*
//         1. Find all branches of animation node, `X`
//         2. If there is only one branch, `A` , and the leaf is a move, then `Move A -> X`
//         3. If there are multiple branches, then `Create X`
//             For each branch:
//             1. If leaf is a create, then ignore
//             2. If leaf is a move, then `Partial Move A -> X`
//         */
//         const branches = getAllBranches(chain)

//         if (branches.length == 1) {
//             // Create a new animation w.r.t the action that's there
//             const transition = createTransitionAnimation(
//                 chain.value,
//                 operations[operations.length - 1].type,
//                 leaves.map((leaf) => leaf.value)
//             )

//             transitions.push(transition)
//         } else {
//             const create = createTransitionAnimation(
//                 chain.value,
//                 AnimationTraceOperatorType.CreateLiteral,
//                 leaves.map((leaf) => leaf.value)
//             )

//             transitions.push(create)

//             // for (const branch of branches) {
//             //     const [brachOperations, branchLeaves] =
//             //         getAllOperationsAndLeaves(chain)

//             //     const branchOperator =
//             //         brachOperations[brachOperations.length - 1]

//             //     if (
//             //         branchOperator == AnimationTraceOperator.MoveAndPlace ||
//             //         branchOperator == AnimationTraceOperator.CopyLiteral
//             //     ) {
//             //         const branchTransition = createTransitionAnimation(
//             //             branch.value,
//             //             branchOperator,
//             //             branchLeaves.map((leaf) => leaf.value)
//             //         )

//             //         transitions.push(branchTransition)
//             //     }
//             // }
//         }
//     }

//     // console.log(transitions.length)
//     return transitions
// }

// export function getAllBranches(
//     chain: AnimationTraceChain,
//     context: {
//         parent: AnimationTraceChain
//         operator: AnimationTraceOperator
//     } = null
// ): AnimationTraceChain[] {
//     // If no children, terminate the tree and return
//     if (chain.children == null) {
//         if (context == null) {
//             return [chain]
//         } else {
//             let parent = clone(context.parent)
//             let end = parent

//             while (end.children != null) {
//                 end = end.children[0][1]
//             }

//             end.children = [[context.operator, { value: chain.value, children: null }]]

//             return [parent]
//         }
//     }

//     let parent: AnimationTraceChain

//     // Otherwise, build the context, first node
//     if (context == null) {
//         parent = { value: chain.value, children: null }
//     } else {
//         parent = clone(context.parent)
//         let end = parent

//         while (end.children != null && end.children.length > 0) {
//             end = end.children[0][1]
//         }

//         end.children = [[context.operator, { value: chain.value, children: null }]]
//     }
//     const branches: AnimationTraceChain[] = []

//     for (const [operator, child] of chain.children) {
//         branches.push(...getAllBranches(child, { parent: parent, operator: operator }))
//     }

//     return branches
// }

// export function getAllOperationsAndLeaves(
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

// function createTransitionAnimation(
//     output: DataInfo,
//     operation: AnimationTraceOperatorType,
//     origins: DataInfo[]
// ): TransitionAnimationNode {
//     const mapping = {
//         [AnimationTraceOperatorType.MoveAndPlace]: transitionMove,
//         [AnimationTraceOperatorType.CopyLiteral]: transitionMove,
//         [AnimationTraceOperatorType.CreateLiteral]: transitionCreate,
//         [AnimationTraceOperatorType.CreateArray]: transitionCreateArray,
//         [AnimationTraceOperatorType.CreateReference]: transitionCreateReference,
//         [AnimationTraceOperatorType.CreateVariable]: transitionCreateVariable,
//         [AnimationTraceOperatorType.Place]: transitionPlace,
//         [AnimationTraceOperatorType.UpdateOperation]: transitionMove,
//     }

//     // Create the transition animation
//     const transition: TransitionAnimationNode = mapping[operation](output, origins)

//     // transition._reads = [...origins.filter((o) => o != null)]
//     // transition._writes = output == null ? [] : [output]

//     return transition
// }
