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
    createPrototypicalPlacePath,
    PrototypicalPlacePath,
} from '../../../../path/prototypical/PrototypicalPlacePath'
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import {
    AnimationData,
    AnimationRuntimeOptions,
} from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionPlace extends TransitionAnimationNode {}

function onBegin(
    animation: TransitionPlace,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    let place = lookupPrototypicalPathById(
        environment,
        `Place${animation.id}`
    ) as PrototypicalPlacePath

    if (place == null) {
        place = createPrototypicalPlacePath(
            [{ type: AccessorType.ID, value: animation.output.id }],
            `Place${animation.id}`
        )
        addPrototypicalPath(environment, place)
        beginPrototypicalPath(place, environment)
    }
}

function onSeek(
    animation: TransitionPlace,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))
    const environment = view

    const place = lookupPrototypicalPathById(
        environment,
        `Place${animation.id}`
    ) as PrototypicalPlacePath
    seekPrototypicalPath(place, environment, t)
}

function onEnd(
    animation: TransitionPlace,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    const place = lookupPrototypicalPathById(
        environment,
        `Place${animation.id}`
    ) as PrototypicalPlacePath
    endPrototypicalPath(place, environment)
    removePrototypicalPath(environment, `Place${animation.id}`)
}

function applyInvariant(
    animation: TransitionPlace,
    view: PrototypicalEnvironmentState
) {
    const environment = view

    let place = lookupPrototypicalPathById(
        environment,
        `Place${animation.id}`
    ) as PrototypicalPlacePath

    if (place == null) {
        place = createPrototypicalPlacePath(
            [{ type: AccessorType.ID, value: animation.output.id }],
            `Place${animation.id}`
        )
        addPrototypicalPath(environment, place)
        beginPrototypicalPath(place, environment)
    }
}

export function transitionPlace(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionPlace {
    return {
        ...createAnimationNode(null, { ...options, delay: 0 }),

        name: 'TransitionPlace',

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
