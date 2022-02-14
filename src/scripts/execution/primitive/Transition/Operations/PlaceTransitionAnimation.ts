import { AnimationOptions, createAnimationNode, duration } from '../../../../animation/animation'
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
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { DataInfo } from '../../../graph/ExecutionGraph'

export interface TransitionPlace extends TransitionAnimationNode {}

function onBegin(animation: TransitionPlace, environment: PrototypicalEnvironmentState) {
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
    environment: PrototypicalEnvironmentState,
    time: number
) {
    let t = animation.ease(time / duration(animation))

    const place = lookupPrototypicalPathById(
        environment,
        `Place${animation.id}`
    ) as PrototypicalPlacePath
    seekPrototypicalPath(place, environment, t)
}

function onEnd(animation: TransitionPlace, environment: PrototypicalEnvironmentState) {
    const place = lookupPrototypicalPathById(
        environment,
        `Place${animation.id}`
    ) as PrototypicalPlacePath
    endPrototypicalPath(place, environment)
    removePrototypicalPath(environment, `Place${animation.id}`)
}

function applyInvariant(animation: TransitionPlace, environment: PrototypicalEnvironmentState) {
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
    output: DataInfo,
    origins: DataInfo[],
    options: AnimationOptions = {}
): TransitionPlace {
    return {
        ...createAnimationNode({ ...options, delay: 0 }),

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
