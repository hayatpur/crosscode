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
import { PrototypicalCreatePath } from '../../../../path/prototypical/PrototypicalCreatePath'
import {
    createPrototypicalCreateReferencePath,
    PrototypicalCreateReferencePath,
} from '../../../../path/prototypical/PrototypicalCreateReferencePath'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { DataInfo } from '../../../graph/ExecutionGraph'

export interface TransitionCreateReference extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreateReference, environment: PrototypicalEnvironmentState) {
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
    environment: PrototypicalEnvironmentState,
    time: number
) {
    let t = animation.ease(time / duration(animation))

    const create = lookupPrototypicalPathById(
        environment,
        `CreateReference${animation.id}`
    ) as PrototypicalCreatePath
    seekPrototypicalPath(create, environment, t)
}

function onEnd(animation: TransitionCreateReference, environment: PrototypicalEnvironmentState) {
    const create = lookupPrototypicalPathById(
        environment,
        `CreateReference${animation.id}`
    ) as PrototypicalCreateReferencePath
    endPrototypicalPath(create, environment)
    removePrototypicalPath(environment, `CreateReference${animation.id}`)
}

function applyInvariant(
    animation: TransitionCreateReference,
    environment: PrototypicalEnvironmentState
) {
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
    output: DataInfo,
    origins: DataInfo[],
    options: AnimationOptions = {}
): TransitionCreateReference {
    return {
        ...createAnimationNode({ ...options, delay: 0 }),

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
