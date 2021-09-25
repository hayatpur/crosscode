import * as ESTree from 'estree';
import { createData } from '../../../environment/data/data';
import { DataType } from '../../../environment/data/DataState';
import { addDataAt, declareVariable } from '../../../environment/environment';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface BindFunctionAnimation extends AnimationNode {
    identifier: string;
    ast: ESTree.FunctionDeclaration;
}

function onBegin(
    animation: BindFunctionAnimation,
    view: ViewState,
    options: AnimationRuntimeOptions
) {
    const environment = getCurrentEnvironment(view);

    // Create a reference for variable
    const reference = createData(DataType.Reference, [], `${animation.id}_ReferenceFunction`);
    const referenceLocation = addDataAt(environment, reference, [], `${animation.id}_AddFunction`);

    const data = createData(
        DataType.Function,
        JSON.stringify(animation.ast),
        `${animation.id}_BindFunctionNew`
    );
    const location = addDataAt(environment, data, [], null);

    reference.value = location;

    declareVariable(environment, animation.identifier, referenceLocation);
}

function onSeek(
    animation: BindFunctionAnimation,
    view: ViewState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: BindFunctionAnimation,
    view: ViewState,
    options: AnimationRuntimeOptions
) {}

export function bindFunctionAnimation(
    identifier: string,
    ast: ESTree.FunctionDeclaration = null,
    options: AnimationOptions = {}
): BindFunctionAnimation {
    return {
        ...createAnimationNode(null, options),
        baseDuration: 5,
        name: `Bind Function (${identifier})`,

        // Attributes
        identifier,
        ast,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
