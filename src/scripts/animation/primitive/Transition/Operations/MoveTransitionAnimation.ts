import {
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../../../environment/EnvironmentState'
import {
    addPrototypicalPath,
    beginPrototypicalPath,
    endPrototypicalPath,
    lookupPrototypicalPathById,
    removePrototypicalPath,
    seekPrototypicalPath,
} from '../../../../path/path'
import {
    createPrototypicalMovementPath,
    PrototypicalMovementPath,
} from '../../../../path/prototypical/PrototypicalMovementPath'
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
    const environment = view

    let movement = lookupPrototypicalPathById(
        environment,
        `Movement${animation.id}`
    ) as PrototypicalMovementPath

    // Create movement path
    if (movement == null) {
        movement = createPrototypicalMovementPath(
            [{ type: AccessorType.ID, value: animation.origins[0].id }],
            [{ type: AccessorType.ID, value: animation.output.id }],
            `Movement${animation.id}`
        )
        addPrototypicalPath(environment, movement)
        beginPrototypicalPath(movement, environment)
    }
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
    ) as PrototypicalMovementPath
    endPrototypicalPath(movement, environment)
    removePrototypicalPath(environment, `Movement${animation.id}`)
}

function applyInvariant(
    animation: TransitionMove,
    view: PrototypicalEnvironmentState
) {
    const environment = view

    let movement = lookupPrototypicalPathById(
        environment,
        `Movement${animation.id}`
    ) as PrototypicalMovementPath

    if (movement == null) {
        movement = createPrototypicalMovementPath(
            [{ type: AccessorType.ID, value: animation.origins[0].id }],
            [{ type: AccessorType.ID, value: animation.output.id }],
            `Movement${animation.id}`
        )
        addPrototypicalPath(environment, movement)
        beginPrototypicalPath(movement, environment)
    }
}

export function transitionMove(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionMove {
    return {
        ...createAnimationNode(null, { ...options, delay: 0, duration: 20 }),

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
