// import { updateRootViewLayout } from '../../../environment/layout'
// import { createLeafViewState, findViewById } from '../../../view/view'
// import { RootViewState } from '../../../view/ViewState'
// import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
// import { AnimationNode, AnimationOptions, createAnimationNode, NodeData } from '../AnimationNode'

// export interface GroupStartAnimation extends AnimationNode {
//     nodeData: NodeData
//     groupId: string
//     leaveEmpty: boolean
//     restart: boolean
// }

// function onBegin(animation: GroupStartAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
//     if (animation.restart) {
//         const newView = findViewById(view, animation.groupId)
//         newView.isActive = true
//         newView.lastActive = performance.now()
//     } else {
//         // Create a new view
//         const newView = createLeafViewState()
//         newView.label = animation.nodeData.type
//         newView.id = animation.groupId

//         // Add the new view to the current view state
//         view.children.push(newView)
//         newView.isActive = true
//         newView.lastActive = performance.now()
//     }

//     if (options.baking) {
//         computeReadAndWrites(animation)
//     }

//     updateRootViewLayout(view)
// }

// function onSeek(animation: GroupStartAnimation, view: RootViewState, time: number, options: AnimationRuntimeOptions) {}

// function onEnd(animation: GroupStartAnimation, view: RootViewState, options: AnimationRuntimeOptions) {}

// function computeReadAndWrites(animation: GroupStartAnimation) {
//     animation._reads = []
//     animation._writes = []
// }

// export function groupStartAnimation(
//     nodeData: NodeData,
//     groupId: string,
//     leaveEmpty = false,
//     restart = false,
//     options: AnimationOptions = {}
// ): GroupStartAnimation {
//     return {
//         ...createAnimationNode(null, options),
//         _name: 'GroupStartAnimation',

//         name: 'Group Start',

//         nodeData,
//         groupId,
//         leaveEmpty,
//         restart,

//         // Callbacks
//         onBegin,
//         onSeek,
//         onEnd,
//     }
// }
