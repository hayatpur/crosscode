import { PrototypicalEnvironmentState } from '../../../../environment/EnvironmentState'
import {
    addPrototypicalPath,
    beginPrototypicalPath,
    endPrototypicalPath,
    lookupPrototypicalPathById,
    removePrototypicalPath,
    seekPrototypicalPath,
} from '../../../../path/path'
import {
    createPrototypicalCreateVariablePath,
    PrototypicalCreateVariablePath,
} from '../../../../path/prototypical/PrototypicalCreateVariablePath'
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import {
    AnimationData,
    AnimationRuntimeOptions,
} from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionCreateVariable extends TransitionAnimationNode {}

function onBegin(
    animation: TransitionCreateVariable,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    let create = lookupPrototypicalPathById(
        environment,
        `CreateVariable${animation.id}`
    ) as PrototypicalCreateVariablePath

    if (create == null) {
        create = createPrototypicalCreateVariablePath(
            animation.output.id,
            animation.output.location,
            `CreateVariable${animation.id}`
        )
        addPrototypicalPath(environment, create)
        beginPrototypicalPath(create, environment)
    }
}

function onSeek(
    animation: TransitionCreateVariable,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))
    const environment = view

    const create = lookupPrototypicalPathById(
        environment,
        `CreateVariable${animation.id}`
    ) as PrototypicalCreateVariablePath
    seekPrototypicalPath(create, environment, t)
}

function onEnd(
    animation: TransitionCreateVariable,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    const create = lookupPrototypicalPathById(
        environment,
        `CreateVariable${animation.id}`
    ) as PrototypicalCreateVariablePath
    endPrototypicalPath(create, environment)
    removePrototypicalPath(environment, `CreateVariable${animation.id}`)
}

function applyInvariant(
    animation: TransitionCreateVariable,
    view: PrototypicalEnvironmentState
) {
    const environment = view

    let create = lookupPrototypicalPathById(
        environment,
        `CreateVariable${animation.id}`
    ) as PrototypicalCreateVariablePath

    if (create == null) {
        create = createPrototypicalCreateVariablePath(
            animation.output.id,
            animation.output.location,
            `CreateVariable${animation.id}`
        )
        addPrototypicalPath(environment, create)
        beginPrototypicalPath(create, environment)
    }
}

export function transitionCreateVariable(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionCreateVariable {
    return {
        ...createAnimationNode(null, { ...options, delay: 0 }),

        name: 'TransitionCreateVariable',

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
