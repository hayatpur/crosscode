import {
    clonePrototypicalData,
    createData,
    replacePrototypicalDataWith,
} from '../../../environment/data/data'
import {
    DataType,
    PrototypicalDataState,
} from '../../../environment/data/DataState'
import {
    addDataAt,
    getMemoryLocation,
    resolvePath,
} from '../../../environment/environment'
import {
    Accessor,
    accessorsToString,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import {
    addPrototypicalPath,
    beginPrototypicalPath,
    endPrototypicalPath,
    lookupPrototypicalPathById,
    removePrototypicalPath,
    seekPrototypicalPath,
} from '../../../path/path'
import {
    createPrototypicalElevationPath,
    PrototypicalElevationPath,
} from '../../../path/prototypical/PrototypicalElevationPath'
import { createPrototypicalInstantMovementPath } from '../../../path/prototypical/PrototypicalInstantMovementPath'
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

export interface CopyDataAnimation extends AnimationNode {
    dataSpecifier: Accessor[]
    outputRegister: Accessor[]
    hardCopy: boolean
}

function onBegin(
    animation: CopyDataAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    const data = resolvePath(
        environment,
        animation.dataSpecifier,
        `${animation.id}_Data`
    ) as PrototypicalDataState
    const copy = clonePrototypicalData(data, false, `${animation.id}_Copy`)
    const location = addDataAt(environment, copy, [], null)
    environment._temps[`CopyDataAnimation${animation.id}`] = location

    // Move copy on top of data
    const instantaneousMovement = createPrototypicalInstantMovementPath(
        location,
        animation.dataSpecifier,
        `InstantMovement${animation.id}`
    )
    addPrototypicalPath(environment, instantaneousMovement)
    beginPrototypicalPath(instantaneousMovement, environment)
    seekPrototypicalPath(instantaneousMovement, environment, 1)
    endPrototypicalPath(instantaneousMovement, environment)
    removePrototypicalPath(environment, `InstantMovement${animation.id}`)

    // Put it in the floating stack
    const register = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_Floating`
    ) as PrototypicalDataState
    replacePrototypicalDataWith(
        register,
        createData(DataType.ID, copy.id, `${animation.id}_Floating`)
    )

    if (animation.hardCopy) {
        data.value = undefined
    }

    if (options.baking) {
        computeReadAndWrites(
            animation,
            {
                location: getMemoryLocation(environment, data).foundLocation,
                id: data.id,
            },
            { location, id: copy.id }
        )
    }

    // Create elevation path
    const elevation = createPrototypicalElevationPath(
        location,
        1,
        `Elevation${animation.id}`
    )
    addPrototypicalPath(environment, elevation)
    beginPrototypicalPath(elevation, environment)
}

function onSeek(
    animation: CopyDataAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))

    const environment = view
    const elevation = lookupPrototypicalPathById(
        environment,
        `Elevation${animation.id}`
    ) as PrototypicalElevationPath
    seekPrototypicalPath(elevation, environment, t)
}

function onEnd(
    animation: CopyDataAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    const elevation = lookupPrototypicalPathById(
        environment,
        `Elevation${animation.id}`
    ) as PrototypicalElevationPath
    endPrototypicalPath(elevation, environment)

    removePrototypicalPath(environment, `Elevation${animation.id}`)
}

function computeReadAndWrites(
    animation: CopyDataAnimation,
    original: AnimationData,
    copy: AnimationData
) {
    animation._reads = [original]
    animation._writes = [copy]
}

export function copyDataAnimation(
    dataSpecifier: Accessor[],
    outputRegister: Accessor[],
    hardCopy: boolean = false,
    options: AnimationOptions = {}
): CopyDataAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'CopyDataAnimation',

        name: `Copy ${accessorsToString(dataSpecifier)} to ${accessorsToString(
            outputRegister
        )}`,

        // Attributes
        dataSpecifier,
        outputRegister,
        hardCopy,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
