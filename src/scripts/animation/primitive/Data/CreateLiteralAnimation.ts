import { createData, replacePrototypicalDataWith } from '../../../environment/data/data'
import { DataType, PrototypicalDataState } from '../../../environment/data/DataState'
import {
    addPrototypicalPath,
    beginPrototypicalPath,
    endPrototypicalPath,
    lookupPrototypicalPathById,
    removePrototypicalPath,
    seekPrototypicalPath,
} from '../../../environment/data/path/path'
import {
    createPrototypicalCreatePath,
    PrototypicalCreatePath,
} from '../../../environment/data/path/primitives/PrototypicalCreatePath'
import { addDataAt, resolvePath } from '../../../environment/environment'
import { Accessor, accessorsToString } from '../../../environment/EnvironmentState'
import { updateRootViewLayout } from '../../../environment/layout'
import { RootViewState } from '../../../view/ViewState'
import { duration } from '../../animation'
import { AnimationData, AnimationDataFlags, AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface CreateLiteralAnimation extends AnimationNode {
    value: string | number | bigint | boolean | RegExp
    locationHint: Accessor[]
    outputRegister: Accessor[]
}

/**
 * Puts data into context.output register.
 * @param animation
 * @param view
 * @param options
 */
function onBegin(animation: CreateLiteralAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment

    updateRootViewLayout(view)

    const data = createData(DataType.Literal, animation.value as number | string | boolean, `${animation.id}_Create`)

    const reference = resolvePath(
        environment,
        animation.locationHint,
        `${animation.id}_Location`
    ) as PrototypicalDataState

    // Add the newly created data to environment
    const loc = addDataAt(environment, data, [], null)
    environment._temps[`CreateLiteralAnimation${animation.id}`] = loc

    const create = createPrototypicalCreatePath(loc, animation.locationHint, `Create${animation.id}`)
    addPrototypicalPath(environment, create)
    beginPrototypicalPath(create, environment)

    updateRootViewLayout(view)

    if (options.baking) {
        computeReadAndWrites(animation, {
            location: environment._temps[`CreateLiteralAnimation${this.id}`],
            id: data.id,
        })
    }

    if (options.baking) {
        computeReadAndWrites(animation, {
            location: environment._temps[`CreateLiteralAnimation${this.id}`],
            id: data.id,
        })
    }

    // Point the output register to the newly created data
    const outputRegister = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_Floating`
    ) as PrototypicalDataState
    replacePrototypicalDataWith(outputRegister, createData(DataType.ID, data.id, `${animation.id}_OutputRegister`))

    updateRootViewLayout(view)
}

function onSeek(
    animation: CreateLiteralAnimation,
    view: RootViewState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))
    const environment = view.environment

    const create = lookupPrototypicalPathById(environment, `Create${animation.id}`) as PrototypicalCreatePath
    seekPrototypicalPath(create, environment, t)
    updateRootViewLayout(view)
}

function onEnd(animation: CreateLiteralAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    delete environment._temps[`CreateLiteralAnimation${animation.id}`]

    const create = lookupPrototypicalPathById(environment, `Create${animation.id}`) as PrototypicalCreatePath
    endPrototypicalPath(create, environment)

    removePrototypicalPath(environment, `Create${animation.id}`)
}

function computeReadAndWrites(animation: CreateLiteralAnimation, data: AnimationData) {
    if (data.flags == null) data.flags = new Set()
    data.flags.add(AnimationDataFlags.Create)

    animation._reads = []
    animation._writes = [data]
}

export function createLiteralAnimation(
    value: string | number | bigint | boolean | RegExp,
    outputRegister: Accessor[],
    locationHint: Accessor[],
    options: AnimationOptions = {}
): CreateLiteralAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'CreateLiteralAnimation',

        baseDuration: 30,

        name: `Create Literal ${value} at ${accessorsToString(outputRegister)}`,

        // Attributes
        value,
        outputRegister,
        locationHint,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
