import { cloneData, createData, replaceDataWith } from '../../../environment/data/data'
import { DataState, DataType } from '../../../environment/data/DataState'
import { addDataAt, getMemoryLocation, resolvePath } from '../../../environment/environment'
import { Accessor, accessorsToString } from '../../../environment/EnvironmentState'
import { updateRootViewLayout } from '../../../environment/layout'
import { getRelativeLocation } from '../../../utilities/math'
import { RootViewState } from '../../../view/ViewState'
import { duration } from '../../animation'
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface CopyDataAnimation extends AnimationNode {
    dataSpecifier: Accessor[]
    outputRegister: Accessor[]
    hardCopy: boolean
}

function onBegin(animation: CopyDataAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const data = resolvePath(environment, animation.dataSpecifier, `${animation.id}_Data`) as DataState
    const copy = cloneData(data, false, `${animation.id}_Copy`)
    copy.transform.styles.elevation = 0
    copy.transform.styles.position = 'absolute'

    // Copy the correct render location
    const renderLocation = getRelativeLocation(data.transform.rendered, environment.transform.rendered)
    copy.transform.styles.left = `${renderLocation.x}px`
    copy.transform.styles.top = `${renderLocation.y}px`

    const location = addDataAt(environment, copy, [], null)
    environment._temps[`CopyDataAnimation${animation.id}`] = location
    updateRootViewLayout(view)

    // Put it in the floating stack
    const register = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState
    replaceDataWith(register, createData(DataType.ID, copy.id, `${animation.id}_Floating`))

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
}

function onSeek(animation: CopyDataAnimation, view: RootViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))

    const environment = view.environment
    const copy = resolvePath(environment, environment._temps[`CopyDataAnimation${animation.id}`], null) as DataState
    copy.transform.styles.elevation = t
}

function onEnd(animation: CopyDataAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const copy = resolvePath(environment, environment._temps[`CopyDataAnimation${animation.id}`], null) as DataState
    copy.transform.styles.elevation = 1

    copy.transform.styles.position = 'absolute'
}

function computeReadAndWrites(animation: CopyDataAnimation, original: AnimationData, copy: AnimationData) {
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

        name: `Copy ${accessorsToString(dataSpecifier)} to ${accessorsToString(outputRegister)}`,

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
