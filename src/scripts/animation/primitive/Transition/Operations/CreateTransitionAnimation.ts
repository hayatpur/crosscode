import { resolvePath } from '../../../../environment/environment'
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
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import {
    AnimationData,
    AnimationRuntimeOptions,
} from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionCreate extends TransitionAnimationNode {
    createPath?: PrototypicalCreatePath
}

function onBegin(
    animation: TransitionCreate,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    if (animation.createPath == null) {
        const create = createPrototypicalCreatePath(
            [{ type: AccessorType.ID, value: animation.output.id }],
            [{ type: AccessorType.ID, value: animation.output.id }],
            `Create${animation.id}`
        )
        addPrototypicalPath(environment, create)
        beginPrototypicalPath(create, environment)
        animation.createPath = create
    }
}

function onSeek(
    animation: TransitionCreate,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))
    const environment = view

    const create = lookupPrototypicalPathById(
        environment,
        `Create${animation.id}`
    ) as PrototypicalCreatePath
    seekPrototypicalPath(create, environment, t)
}

function onEnd(
    animation: TransitionCreate,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    const data = resolvePath(
        environment,
        [{ type: AccessorType.ID, value: animation.output.id }],
        null
    )

    const create = lookupPrototypicalPathById(
        environment,
        `Create${animation.id}`
    ) as PrototypicalCreatePath
    endPrototypicalPath(create, environment)
    removePrototypicalPath(environment, `Create${animation.id}`)
}

function applyInvariant(
    animation: TransitionCreate,
    view: PrototypicalEnvironmentState
) {
    const environment = view

    if (animation.createPath == null) {
        const create = createPrototypicalCreatePath(
            [{ type: AccessorType.ID, value: animation.output.id }],
            [{ type: AccessorType.ID, value: animation.output.id }],
            `Create${animation.id}`
        )
        addPrototypicalPath(environment, create)
        beginPrototypicalPath(create, environment)
        animation.createPath = create
    }
}

export function transitionCreate(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionCreate {
    return {
        ...createAnimationNode(null, { ...options }),

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
