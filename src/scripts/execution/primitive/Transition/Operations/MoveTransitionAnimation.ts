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
    createPrototypicalMovementPath,
    PrototypicalMovementPath,
} from '../../../../path/prototypical/PrototypicalMovementPath'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { DataInfo } from '../../../graph/ExecutionGraph'

export interface TransitionMove extends TransitionAnimationNode {}

function onBegin(animation: TransitionMove, environment: PrototypicalEnvironmentState) {
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
    environment: PrototypicalEnvironmentState,
    time: number
) {
    let t = animation.ease(time / duration(animation))

    const movement = lookupPrototypicalPathById(environment, `Movement${animation.id}`)

    seekPrototypicalPath(movement, environment, t)
}

function onEnd(animation: TransitionMove, environment: PrototypicalEnvironmentState) {
    const movement = lookupPrototypicalPathById(
        environment,
        `Movement${animation.id}`
    ) as PrototypicalMovementPath
    endPrototypicalPath(movement, environment)
    removePrototypicalPath(environment, `Movement${animation.id}`)
}

function applyInvariant(animation: TransitionMove, environment: PrototypicalEnvironmentState) {
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
    output: DataInfo,
    origins: DataInfo[],
    options: AnimationOptions = {}
): TransitionMove {
    return {
        ...createAnimationNode({ ...options, delay: 0, duration: 20 }),

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
