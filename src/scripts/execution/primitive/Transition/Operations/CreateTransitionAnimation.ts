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
    createPrototypicalCreatePath,
    PrototypicalCreatePath,
} from '../../../../path/prototypical/PrototypicalCreatePath'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { DataInfo } from '../../../graph/ExecutionGraph'

export interface TransitionCreate extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreate, environment: PrototypicalEnvironmentState) {
    let create = lookupPrototypicalPathById(
        environment,
        `Create${animation.id}`
    ) as PrototypicalCreatePath

    if (create == null) {
        create = createPrototypicalCreatePath(
            [{ type: AccessorType.ID, value: animation.output.id }],
            [{ type: AccessorType.ID, value: animation.output.id }],
            `Create${animation.id}`
        )
        addPrototypicalPath(environment, create)
        beginPrototypicalPath(create, environment)
    }
}

function onSeek(
    animation: TransitionCreate,
    environment: PrototypicalEnvironmentState,
    time: number
) {
    let t = animation.ease(time / duration(animation))

    const create = lookupPrototypicalPathById(
        environment,
        `Create${animation.id}`
    ) as PrototypicalCreatePath
    seekPrototypicalPath(create, environment, t)
}

function onEnd(animation: TransitionCreate, environment: PrototypicalEnvironmentState) {
    const create = lookupPrototypicalPathById(
        environment,
        `Create${animation.id}`
    ) as PrototypicalCreatePath
    endPrototypicalPath(create, environment)
    removePrototypicalPath(environment, `Create${animation.id}`)
}

function applyInvariant(animation: TransitionCreate, environment: PrototypicalEnvironmentState) {
    let create = lookupPrototypicalPathById(
        environment,
        `Create${animation.id}`
    ) as PrototypicalCreatePath

    if (create == null) {
        create = createPrototypicalCreatePath(
            [{ type: AccessorType.ID, value: animation.output.id }],
            [{ type: AccessorType.ID, value: animation.output.id }],
            `Create${animation.id}`
        )
        addPrototypicalPath(environment, create)
        beginPrototypicalPath(create, environment)
    }
}

export function transitionCreate(
    output: DataInfo,
    origins: DataInfo[],
    options: AnimationOptions = {}
): TransitionCreate {
    return {
        ...createAnimationNode({ ...options, delay: 0 }),

        name: 'TransitionCreate',

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
