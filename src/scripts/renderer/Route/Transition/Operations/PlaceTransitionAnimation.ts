// import { AnimationOptions, createAnimationNode, duration } from '../../../../animation/animation'
// import { EnvironmentState } from '../../../../environment/EnvironmentState'
// import { TransitionAnimationNode } from '../../../../renderer/Route/Transition'
// import { DataInfo } from '../../../graph/ExecutionGraph'

// export interface TransitionPlace extends TransitionAnimationNode {}

// function onBegin(animation: TransitionPlace, environment: EnvironmentState) {
//     const renderer = environment.renderer
//     if (renderer == null) {
//         return
//     }
// }

// function onSeek(animation: TransitionPlace, environment: EnvironmentState, time: number) {
//     let t = animation.ease(time / duration(animation))

//     const renderer = environment.renderer
//     if (renderer == null) {
//         return
//     }
// }

// function onEnd(animation: TransitionPlace, environment: EnvironmentState) {
//     const renderer = environment.renderer
//     if (renderer == null) {
//         return
//     }
// }

// function applyInvariant(animation: TransitionPlace, environment: EnvironmentState) {
//     const renderer = environment.renderer
//     if (renderer == null || animation.isPlaying) {
//         return
//     }
// }

// export function transitionPlace(
//     output: DataInfo,
//     origins: DataInfo[],
//     options: AnimationOptions = {}
// ): TransitionPlace {
//     return {
//         ...createAnimationNode({ ...options, delay: 0 }),

//         name: 'TransitionPlace',

//         output,
//         origins,

//         // Callbacks
//         onBegin,
//         onSeek,
//         onEnd,

//         // Transition
//         applyInvariant,
//     }
// }
