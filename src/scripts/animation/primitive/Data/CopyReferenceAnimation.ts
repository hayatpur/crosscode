import {
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

export interface CopyReferenceAnimation extends AnimationNode {
    dataSpecifier: Accessor[]
    outputRegister: Accessor[]
}

function onBegin(
    animation: CopyReferenceAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    const data = resolvePath(
        environment,
        animation.dataSpecifier,
        `${animation.id}_Data`
    ) as PrototypicalDataState
    const reference = createData(
        DataType.Reference,
        getMemoryLocation(environment, data).foundLocation,
        `${animation.id}_Reference`
    )
    const loc = addDataAt(environment, reference, [], null)

    if (options.baking) {
        computeReadAndWrites(
            animation,
            {
                location: getMemoryLocation(environment, data).foundLocation,
                id: data.id,
            },
            { location: loc, id: reference.id }
        )
    }

    // Put it in the floating stack
    const register = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_FloatingRegister`
    ) as PrototypicalDataState
    replacePrototypicalDataWith(
        register,
        createData(DataType.ID, reference.id, `${animation.id}_Floating`)
    )
}

function onSeek(
    animation: CopyReferenceAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))
}

function onEnd(
    animation: CopyReferenceAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

function computeReadAndWrites(
    animation: CopyReferenceAnimation,
    original: AnimationData,
    copy: AnimationData
) {
    animation._reads = [original]
    animation._writes = [copy]
}

export function copyReferenceAnimation(
    dataSpecifier: Accessor[],
    outputRegister: Accessor[],
    hardCopy: boolean = false,
    options: AnimationOptions = {}
): CopyReferenceAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'CopyReferenceAnimation',

        name: `CopyReference ${accessorsToString(
            dataSpecifier
        )} to ${accessorsToString(outputRegister)}`,

        // Attributes
        dataSpecifier,
        outputRegister,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
