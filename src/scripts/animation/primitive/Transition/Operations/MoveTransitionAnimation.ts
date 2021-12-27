import { PrototypicalEnvironmentState } from '../../../../environment/EnvironmentState'
import {
    endPrototypicalPath,
    lookupPrototypicalPathById,
    removePrototypicalPath,
    seekPrototypicalPath,
} from '../../../../path/path'
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import {
    AnimationData,
    AnimationRuntimeOptions,
} from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionMove extends TransitionAnimationNode {}

function onBegin(
    animation: TransitionMove,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    // const environment = view
    // const data = resolvePath(
    //     environment,
    //     [{ type: AccessorType.ID, value: animation.output.id }],
    //     null
    // )
    // const prevLeaf = getLastActiveLeafView(view)
    // const currLeaf = getCurrentLeafView(view)
    // // Create movement path
    // const movement: PrototypicalPath = createPrototypicalGlobalMovementPath(
    //     [{ type: AccessorType.ID, value: animation.output.id }],
    //     [{ type: AccessorType.ID, value: animation.origins[0].id }],
    //     currLeaf.id,
    //     prevLeaf.id,
    //     `Movement${animation.id}`
    // )
    // addPrototypicalPath(environment, movement)
}

function onSeek(
    animation: TransitionMove,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))
    const environment = view

    const movement = lookupPrototypicalPathById(
        environment,
        `Movement${animation.id}`
    )
    seekPrototypicalPath(movement, environment, t)
}

function onEnd(
    animation: TransitionMove,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    const movement = lookupPrototypicalPathById(
        environment,
        `Movement${animation.id}`
    )
    endPrototypicalPath(movement, environment)
    removePrototypicalPath(environment, `Movement${animation.id}`)
}

function applyInvariant(
    animation: TransitionMove,
    view: PrototypicalEnvironmentState
) {}

export function transitionMove(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionMove {
    return {
        ...createAnimationNode(null, { ...options, duration: 150 }),

        name: 'TransitionMove',

        output,
        origins,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,

        // Transition
        applyInvariant,
    }
}

// function getComputedStyleOfData(data: DataTransform, property: string) {
//     const temp = document.createElement('div')
//     document.getElementById('temporary-layout').append(temp)

//     for (const c of data.classList) {
//         temp.classList.add(c)
//     }

//     for (const [key, value] of Object.entries(data.styles)) {
//         temp.style[key] = value
//     }

//     temp.style.position = 'absolute'

//     reflow(temp)

//     const computed = getComputedStyle(temp, property)
//     // temp.remove()

//     return computed[property]
// }
