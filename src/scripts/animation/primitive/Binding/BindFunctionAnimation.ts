import * as ESTree from 'estree'
import { createData } from '../../../environment/data/data'
import { DataType } from '../../../environment/data/DataState'
import { addDataAt, declareVariable } from '../../../environment/environment'
import { updateRootViewLayout } from '../../../environment/layout'
import { RootViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface BindFunctionAnimation extends AnimationNode {
    identifier: string
    ast: ESTree.FunctionDeclaration
}

function onBegin(animation: BindFunctionAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment

    // Create a reference for variable
    const reference = createData(DataType.Reference, [], `${animation.id}_ReferenceFunction`)
    const referenceLocation = addDataAt(environment, reference, [], `${animation.id}_AddFunction`)
    updateRootViewLayout(view)

    const data = createData(DataType.Function, JSON.stringify(animation.ast), `${animation.id}_BindFunctionNew`)
    const location = addDataAt(environment, data, [], null)
    updateRootViewLayout(view)

    reference.value = location

    declareVariable(environment, animation.identifier, referenceLocation)
    updateRootViewLayout(view)

    if (options.baking) {
        computeReadAndWrites(animation)
    }
}

function onSeek(
    animation: BindFunctionAnimation,
    view: RootViewState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(animation: BindFunctionAnimation, view: RootViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: BindFunctionAnimation) {
    animation._reads = []
    animation._writes = []
}

export function bindFunctionAnimation(
    identifier: string,
    ast: ESTree.FunctionDeclaration = null,
    options: AnimationOptions = {}
): BindFunctionAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'BindFunctionAnimation',

        baseDuration: 5,
        name: `Bind Function (${identifier})`,

        // Attributes
        identifier,
        ast,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
