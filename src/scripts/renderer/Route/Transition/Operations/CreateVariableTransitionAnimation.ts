// import { AnimationOptions, createAnimationNode, duration } from '../../../../animation/animation'
// import { EnvironmentState } from '../../../../environment/EnvironmentState'
// import { IdentifierRenderer } from '../../../../environment/identifier/IdentifierRenderer'
// import { TransitionAnimationNode } from '../../../../renderer/Route/Transition'
// import { DataInfo } from '../../../graph/ExecutionGraph'

// export interface TransitionCreateVariable extends TransitionAnimationNode {}

// function onBegin(animation: TransitionCreateVariable, environment: EnvironmentState) {
//     const renderer = environment.renderer
//     if (renderer == null) {
//         return
//     }

//     const children = renderer.getAllChildRenderers()
//     const identifier = children[animation.output.id] as IdentifierRenderer
//     identifier.element.style.opacity = `${0}`
// }

// function onSeek(animation: TransitionCreateVariable, environment: EnvironmentState, time: number) {
//     let t = animation.ease(time / duration(animation))

//     const renderer = environment.renderer
//     if (renderer == null) {
//         return
//     }

//     const children = renderer.getAllChildRenderers()
//     const identifier = children[animation.output.id] as IdentifierRenderer
//     identifier.element.style.opacity = `${t}`
// }

// function onEnd(animation: TransitionCreateVariable, environment: EnvironmentState) {
//     const renderer = environment.renderer
//     if (renderer == null) {
//         return
//     }

//     const children = renderer.getAllChildRenderers()
//     const identifier = children[animation.output.id] as IdentifierRenderer
//     identifier.element.style.opacity = `${1}`
// }

// function applyInvariant(animation: TransitionCreateVariable, environment: EnvironmentState) {
//     const renderer = environment.renderer
//     if (renderer == null || animation.isPlaying) {
//         return
//     }

//     const children = renderer.getAllChildRenderers()
//     const identifier = children[animation.output.id] as IdentifierRenderer
//     identifier.element.style.opacity = `${0}`
// }

// export function transitionCreateVariable(
//     output: DataInfo,
//     origins: DataInfo[],
//     options: AnimationOptions = {}
// ): TransitionCreateVariable {
//     return {
//         ...createAnimationNode({ ...options, delay: 0 }),

//         name: 'TransitionCreateVariable',

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
