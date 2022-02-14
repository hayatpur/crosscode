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
    createPrototypicalCreateArrayPath,
    PrototypicalCreateArrayPath,
} from '../../../../path/prototypical/PrototypicalCreateArrayPath'
import { PrototypicalCreatePath } from '../../../../path/prototypical/PrototypicalCreatePath'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { DataInfo } from '../../../graph/ExecutionGraph'

export interface TransitionCreateArray extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreateArray, environment: PrototypicalEnvironmentState) {
    let create = lookupPrototypicalPathById(
        environment,
        `CreateArray${animation.id}`
    ) as PrototypicalCreateArrayPath

    if (create == null) {
        create = createPrototypicalCreateArrayPath(
            [{ type: AccessorType.ID, value: animation.output.id }],
            [{ type: AccessorType.ID, value: animation.output.id }],
            `CreateArray${animation.id}`
        )
        addPrototypicalPath(environment, create)
        beginPrototypicalPath(create, environment)
    }
}

function onSeek(
    animation: TransitionCreateArray,
    environment: PrototypicalEnvironmentState,
    time: number
) {
    let t = animation.ease(time / duration(animation))

    const create = lookupPrototypicalPathById(
        environment,
        `CreateArray${animation.id}`
    ) as PrototypicalCreatePath
    seekPrototypicalPath(create, environment, t)
}

function onEnd(animation: TransitionCreateArray, environment: PrototypicalEnvironmentState) {
    const create = lookupPrototypicalPathById(
        environment,
        `CreateArray${animation.id}`
    ) as PrototypicalCreateArrayPath
    endPrototypicalPath(create, environment)
    removePrototypicalPath(environment, `Create${animation.id}`)
}

function applyInvariant(
    animation: TransitionCreateArray,
    environment: PrototypicalEnvironmentState
) {
    let create = lookupPrototypicalPathById(
        environment,
        `CreateArray${animation.id}`
    ) as PrototypicalCreateArrayPath

    if (create == null) {
        create = createPrototypicalCreateArrayPath(
            [{ type: AccessorType.ID, value: animation.output.id }],
            [{ type: AccessorType.ID, value: animation.output.id }],
            `CreateArray${animation.id}`
        )
        addPrototypicalPath(environment, create)
        beginPrototypicalPath(create, environment)
    }
}

export function transitionCreateArray(
    output: DataInfo,
    origins: DataInfo[],
    options: AnimationOptions = {}
): TransitionCreateArray {
    return {
        ...createAnimationNode({ ...options }),

        name: 'TransitionCreateArray',

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
