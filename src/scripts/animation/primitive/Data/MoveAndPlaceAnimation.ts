import { replacePrototypicalDataWith } from '../../../environment/data/data'
import {
    instanceOfPrototypicalData,
    PrototypicalDataState,
} from '../../../environment/data/DataState'
import {
    getMemoryLocation,
    removeAt,
    resolvePath,
} from '../../../environment/environment'
import {
    Accessor,
    accessorsToString,
    instanceOfPrototypicalEnvironment,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import {
    addPrototypicalPath,
    beginPrototypicalPath,
    endPrototypicalPath,
    lookupPrototypicalPathById,
    PrototypicalPath,
    removePrototypicalPath,
    seekPrototypicalPath,
} from '../../../path/path'
import {
    createPrototypicalMovementPath,
    PrototypicalMovementPath,
} from '../../../path/prototypical/PrototypicalMovementPath'
import {
    createPrototypicalPlacePath,
    PrototypicalPlacePath,
} from '../../../path/prototypical/PrototypicalPlacePath'
import { remap } from '../../../utilities/math'
import { duration } from '../../animation'
import {
    AnimationData,
    AnimationRuntimeOptions,
} from '../../graph/AnimationGraph'
import {
    AnimationNode,
    AnimationOptions,
    createAnimationNode,
} from '../AnimationNode'

/**
 * Move and place animation or just place if the from
 * is not defined.
 */
export interface MoveAndPlaceAnimation extends AnimationNode {
    inputSpecifier: Accessor[]
    outputSpecifier: Accessor[]

    hasReplaced: boolean
}

function onBegin(
    animation: MoveAndPlaceAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    const from = resolvePath(
        environment,
        animation.inputSpecifier,
        null,
        null,
        {
            noResolvingReference: true,
        }
    ) as PrototypicalDataState

    const to = resolvePath(
        environment,
        animation.outputSpecifier,
        `${animation.id}_To(${accessorsToString(animation.outputSpecifier)})`
    )

    let movement: PrototypicalMovementPath

    if (instanceOfPrototypicalData(to)) {
        // Create movement path
        movement = createPrototypicalMovementPath(
            animation.inputSpecifier,
            animation.outputSpecifier,
            `Movement${animation.id}`
        )
        addPrototypicalPath(environment, movement)
    }

    // Create placement path
    const placement: PrototypicalPath = createPrototypicalPlacePath(
        animation.inputSpecifier,
        `Placement${animation.id}`
    )
    addPrototypicalPath(environment, placement)

    if (options.baking) {
        const fromData = {
            location: getMemoryLocation(environment, from).foundLocation,
            id: from.id,
        }

        if (instanceOfPrototypicalEnvironment(to)) {
            computeReadAndWrites(animation, fromData, null)
        } else {
            computeReadAndWrites(animation, fromData, {
                location: getMemoryLocation(environment, to).foundLocation,
                id: to.id,
            })
        }
    }

    if (movement != null) {
        beginPrototypicalPath(movement, view)
    }

    animation.hasReplaced = false
}

function onSeek(
    animation: MoveAndPlaceAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))

    const environment = view
    const tn = time / duration(animation)

    if (!animation.hasReplaced) {
        const from = resolvePath(
            environment,
            animation.inputSpecifier,
            null,
            null,
            {
                noResolvingReference: true,
            }
        ) as PrototypicalDataState

        const to = resolvePath(
            environment,
            animation.outputSpecifier,
            `${animation.id}_To(${accessorsToString(
                animation.outputSpecifier
            )})`
        )

        if (instanceOfPrototypicalData(to)) {
            removeAt(
                environment,
                getMemoryLocation(environment, from).foundLocation
            )
            replacePrototypicalDataWith(to, from, { frame: true, id: true })
        }

        animation.hasReplaced = true
    }

    const movement = lookupPrototypicalPathById(
        environment,
        `Movement${animation.id}`
    ) as PrototypicalMovementPath

    const placement = lookupPrototypicalPathById(
        environment,
        `Placement${animation.id}`
    ) as PrototypicalPlacePath

    // Move
    if (tn <= 0.7 && movement != null) {
        let t = animation.ease(remap(tn, 0, 0.7, 0, 1))
        seekPrototypicalPath(movement, environment, t)
    }
    // Place
    else if (tn >= 0.8 || movement == null) {
        let t: number

        if (movement == null) {
            t = animation.ease(tn)
        } else {
            t = animation.ease(remap(tn, 0.8, 1, 0, 1))
        }

        if (!placement.meta.isPlaying) {
            beginPrototypicalPath(placement, environment)

            if (movement != null) {
                endPrototypicalPath(movement, environment)
            }
        }

        seekPrototypicalPath(placement, environment, t)
    }
}

function onEnd(
    animation: MoveAndPlaceAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    // Paths

    // End placement
    const placement = lookupPrototypicalPathById(
        environment,
        `Placement${animation.id}`
    ) as PrototypicalPlacePath
    endPrototypicalPath(placement, environment)

    // Remove paths from environment
    removePrototypicalPath(environment, `Movement${animation.id}`)
    removePrototypicalPath(environment, `Placement${animation.id}`)

    const from = resolvePath(
        environment,
        animation.inputSpecifier,
        null,
        null,
        {
            noResolvingReference: true,
        }
    ) as PrototypicalDataState

    const to = resolvePath(
        environment,
        animation.outputSpecifier,
        `${animation.id}_To(${accessorsToString(animation.outputSpecifier)})`
    )
}

function computeReadAndWrites(
    animation: MoveAndPlaceAnimation,
    inputData: AnimationData,
    outputData: AnimationData
) {
    animation._reads = [inputData]
    animation._writes = outputData ? [outputData, inputData] : [inputData]
}

export function moveAndPlaceAnimation(
    inputSpecifier: Accessor[],
    outputSpecifier: Accessor[],
    noMove: boolean = false,
    options: AnimationOptions = {}
): MoveAndPlaceAnimation {
    return {
        ...createAnimationNode(null, {
            ...options,
        }),
        _name: 'MoveAndPlaceAnimation',

        name: `Move data at ${accessorsToString(
            inputSpecifier
        )} onto ${accessorsToString(outputSpecifier)}`,

        // Attributes
        inputSpecifier,
        outputSpecifier,

        hasReplaced: false,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
