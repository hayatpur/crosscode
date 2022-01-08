import { PrototypicalEnvironmentState } from '../../../../environment/EnvironmentState'
import {
    addPrototypicalPath,
    beginPrototypicalPath,
    endPrototypicalPath,
    lookupPrototypicalPathById,
    removePrototypicalPath,
    seekPrototypicalPath,
} from '../../../../path/path'
import { PrototypicalCreatePath } from '../../../../path/prototypical/PrototypicalCreatePath'
import {
    createPrototypicalCreateReferencePath,
    PrototypicalCreateReferencePath,
} from '../../../../path/prototypical/PrototypicalCreateReferencePath'
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import {
    AnimationData,
    AnimationRuntimeOptions,
} from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionCreateReference extends TransitionAnimationNode {}

function onBegin(
    animation: TransitionCreateReference,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    let create = lookupPrototypicalPathById(
        environment,
        `CreateReference${animation.id}`
    ) as PrototypicalCreateReferencePath

    if (create == null) {
        create = createPrototypicalCreateReferencePath(
            animation.output.location,
            `CreateReference${animation.id}`
        )
        addPrototypicalPath(environment, create)
        beginPrototypicalPath(create, environment)
    }
}

function onSeek(
    animation: TransitionCreateReference,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))
    const environment = view

    const create = lookupPrototypicalPathById(
        environment,
        `CreateReference${animation.id}`
    ) as PrototypicalCreatePath
    seekPrototypicalPath(create, environment, t)
}

function onEnd(
    animation: TransitionCreateReference,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    const create = lookupPrototypicalPathById(
        environment,
        `CreateReference${animation.id}`
    ) as PrototypicalCreateReferencePath
    endPrototypicalPath(create, environment)
    removePrototypicalPath(environment, `CreateReference${animation.id}`)
}

function applyInvariant(
    animation: TransitionCreateReference,
    view: PrototypicalEnvironmentState
) {
    const environment = view

    let create = lookupPrototypicalPathById(
        environment,
        `CreateReference${animation.id}`
    ) as PrototypicalCreateReferencePath

    if (create == null) {
        create = createPrototypicalCreateReferencePath(
            animation.output.location,
            `CreateReference${animation.id}`
        )
        addPrototypicalPath(environment, create)
        beginPrototypicalPath(create, environment)
    }
}

export function transitionCreateReference(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionCreateReference {
    return {
        ...createAnimationNode(null, { ...options, delay: 0 }),

        name: 'TransitionCreateReference',

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
