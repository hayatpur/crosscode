import { PrototypicalDataState } from '../../../environment/data/DataState'
import {
    addPrototypicalPath,
    beginPrototypicalPath,
    endPrototypicalPath,
    lookupPrototypicalPathById,
    removePrototypicalPath,
    seekPrototypicalPath,
} from '../../../environment/data/path/path'
import {
    createPrototypicalElevationPath,
    PrototypicalElevationPath,
} from '../../../environment/data/path/primitives/PrototypicalElevationPath'
import { getMemoryLocation, resolvePath } from '../../../environment/environment'
import { Accessor } from '../../../environment/EnvironmentState'
import { RootViewState } from '../../../view/ViewState'
import { duration } from '../../animation'
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface FloatAnimation extends AnimationNode {
    dataSpecifier: Accessor[]
}

function onBegin(animation: FloatAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const data = resolvePath(environment, animation.dataSpecifier, null) as PrototypicalDataState

    if (options.baking) {
        computeReadAndWrites(animation, { location: getMemoryLocation(environment, data).foundLocation, id: data.id })
    }

    // Create elevation path
    const elevation = createPrototypicalElevationPath(animation.dataSpecifier, 1, `Elevation${animation.id}`)
    addPrototypicalPath(environment, elevation)
    beginPrototypicalPath(elevation, environment)
}

function onSeek(animation: FloatAnimation, view: RootViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))

    const environment = view.environment
    const elevation = lookupPrototypicalPathById(environment, `Elevation${animation.id}`) as PrototypicalElevationPath
    seekPrototypicalPath(elevation, environment, t)
}

function onEnd(animation: FloatAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const elevation = lookupPrototypicalPathById(environment, `Elevation${animation.id}`) as PrototypicalElevationPath
    endPrototypicalPath(elevation, environment)

    removePrototypicalPath(environment, `Elevation${animation.id}`)
}

function computeReadAndWrites(animation: FloatAnimation, data: AnimationData) {
    animation._reads = [data]
    animation._writes = []
}

export function floatAnimation(dataSpecifier: Accessor[], options: AnimationOptions = {}): FloatAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'FloatAnimation',

        name: 'FloatAnimation',

        // Attributes
        dataSpecifier,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
