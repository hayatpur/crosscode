import { AnimationOptions, createAnimationNode, duration } from '../../../../animation/animation'
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
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { DataInfo } from '../../../graph/ExecutionGraph'

export interface TransitionCreateVariable extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreateVariable, environment: PrototypicalEnvironmentState) {
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
    environment: PrototypicalEnvironmentState,
    time: number
) {
    let t = animation.ease(time / duration(animation))

    const create = lookupPrototypicalPathById(
        environment,
        `CreateVariable${animation.id}`
    ) as PrototypicalCreateVariablePath
    seekPrototypicalPath(create, environment, t)
}

function onEnd(animation: TransitionCreateVariable, environment: PrototypicalEnvironmentState) {
    const create = lookupPrototypicalPathById(
        environment,
        `CreateVariable${animation.id}`
    ) as PrototypicalCreateVariablePath
    endPrototypicalPath(create, environment)
    removePrototypicalPath(environment, `CreateVariable${animation.id}`)
}

function applyInvariant(
    animation: TransitionCreateVariable,
    environment: PrototypicalEnvironmentState
) {
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
    output: DataInfo,
    origins: DataInfo[],
    options: AnimationOptions = {}
): TransitionCreateVariable {
    return {
        ...createAnimationNode({ ...options, delay: 0 }),

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
