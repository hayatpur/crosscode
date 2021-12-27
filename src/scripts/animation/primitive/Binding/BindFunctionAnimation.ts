import * as ESTree from 'estree'
import { createData } from '../../../environment/data/data'
import { DataType } from '../../../environment/data/DataState'
import { addDataAt, declareVariable } from '../../../environment/environment'
import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import {
    AnimationNode,
    AnimationOptions,
    createAnimationNode,
} from '../AnimationNode'

export interface BindFunctionAnimation extends AnimationNode {
    identifier: string
    ast: ESTree.FunctionDeclaration
}

function onBegin(
    animation: BindFunctionAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    // Create a reference for variable
    const reference = createData(
        DataType.Reference,
        [],
        `${animation.id}_ReferenceFunction`
    )
    const referenceLocation = addDataAt(
        environment,
        reference,
        [],
        `${animation.id}_AddFunction`
    )

    const data = createData(
        DataType.Function,
        JSON.stringify(animation.ast),
        `${animation.id}_BindFunctionNew`
    )
    const location = addDataAt(environment, data, [], null)

    reference.value = location

    declareVariable(environment, animation.identifier, referenceLocation)

    if (options.baking) {
        computeReadAndWrites(animation)
    }
}

function onSeek(
    animation: BindFunctionAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: BindFunctionAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

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
