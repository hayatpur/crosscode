import { createData, replaceDataWith } from '../../../environment/data/data';
import { DataState, DataType } from '../../../environment/data/DataState';
import { resolvePath } from '../../../environment/environment';
import { Accessor, AccessorType } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface FindVariableAnimation extends AnimationNode {
    identifier: string;
    outputRegister: Accessor[];
}

function onBegin(animation: FindVariableAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);

    const reference = resolvePath(
        environment,
        [{ type: AccessorType.Symbol, value: animation.identifier }],
        null,
        null,
        { noResolvingReference: true }
    );

    // Put it in the floating stack
    const register = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_FloatingRegister`
    ) as DataState;

    replaceDataWith(register, createData(DataType.ID, reference.id, `${animation.id}_Floating`));
}

function onSeek(animation: FindVariableAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));
}

function onEnd(animation: FindVariableAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

export function findVariableAnimation(
    identifier: string,
    outputRegister: Accessor[],
    options: AnimationOptions = {}
): FindVariableAnimation {
    return {
        ...createAnimationNode(null, options),

        name: `Locating ${identifier}`,

        // Attributes
        identifier,
        outputRegister,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
